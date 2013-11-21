var socket = io.connect('http://192.241.169.33:8080/');

var djSlot1Empty = false;
var djSlot2Empty = false;

var currentDJ = null;

var bIsDJ = false;

var playStart = 0;

var lastUpload = null;

var playerInfo = {};
playerInfo.clientName = "Guest_" + Math.floor(Math.random()*999);

socket.on('connect', function(){
	console.log("Connected!");
	socket.emit('initClient', playerInfo);
});

socket.on('updateDjs', function(dj1, dj2, activeDJ, activeSong) {
	var delivery = new Delivery(socket);

	updateDJ(1, dj1);
	updateDJ(2, dj2);
	currentDJ = activeDJ;

	if(currentDJ == null) {
		$("#activeDJName").html("No DJ's Are Playing");
	} else {
		if(dj1 != null && dj1.clientName == playerInfo.clientName) {
			$("#uploadDiv1").css('display','block');
		} else if(dj2 != null && dj2.clientName == playerInfo.clientName){
			$("#uploadDiv2").css('display','block');
		}
		$("#activeDJName").html(currentDJ.clientName);
	}

	if(activeSong == null) {
		$("#activeSongName").html("No Song Is Playing :(");
	} else {
		$("#activeSongName").html(activeSong);
	}

	delivery.on('delivery.connect',function(delivery){
      	$("#uploadDiv1").change(function(evt) {
    		if(bIsDJ) {
        		var file = $("input[type=file]")[0].files[0];
        		if(lastUpload == file) {return;}
        		console.log("send File!");
        		lastUpload = file;
    			delivery.send(file);
        		evt.preventDefault();
    		}
	    });

	    $("#uploadDiv2").change(function(evt) {
	    	if(bIsDJ) {
        		var file = $("input[type=file]")[1].files[0];
        		if(lastUpload == file) {return;}
        		console.log("send File!");
        		lastUpload = file;
        		lastUpload = file;
    			delivery.send(file);
        		evt.preventDefault();
    		}
	    });
    });
});

function updateDJ(djNumber, djInfo) {
	if(djNumber == 1) {
		if(djInfo == null) {
			djSlot1Empty = true;
			$("#dj1Name").html("Slot Available");
		} else {
			djSlot1Empty = false;
			$("#dj1Name").html(djInfo.clientName);
		}
	} else if(djNumber == 2) {
		if(djInfo == null) {
			djSlot2Empty = true;
			$("#dj2Name").html("Slot Available");
		} else {
			djSlot2Empty = false;
			$("#dj2Name").html(djInfo.clientName);
		}
	}
}

function setDJ(djNumber) {
	if(!bIsDJ) {
		socket.emit('tryBecomeDJ', djNumber);
		bIsDJ = true;
	}
}

$(function(){

	$("#dj1Panel").click(function(evt){
		if(djSlot1Empty) {
        	setDJ(1);
    	}
    });

	$("#dj2Panel").click(function(evt){
		if(djSlot2Empty) {
        	setDJ(2);
        }
    });

    $('audio').bind('timeupdate', function() {
    	$('#timeLeft').html(Math.round(60 - this.currentTime));
    	if(Math.abs(this.currentTime - playStart) > 1.5) {
      		this.currentTime = playStart;
    	}
  	});

  	$("#vote_up").click(function(evt){
		if(currentDJ != null) {
        	socket.emit('voteUp', playerInfo.clientName);
    	}
    });

    $("#vote_down").click(function(evt){
		if(currentDJ != null) {
        	socket.emit('voteDown', playerInfo.clientName);
    	}
    });

    $("#sendBtn").click(function(evt){
		if($("#chatInput").val() != '') {
        	socket.emit('sendChat', $("#chatInput").val());
    	}
    	$("#chatInput").val("");
    });

    $('#chatInput').keypress(function(e) {
		if(e.which == 13) {
			$('#sendBtn').focus().click();
		}
	});
});

socket.on('resync', function(startTime) {
    playStart = startTime;
});

socket.on('nextSong', function(startTime, nextFile) {
	console.log("Socket Says Next Song!: " + startTime);
	playFile(nextFile, startTime);
});

socket.on('updateScore', function(upScore, downScore) {
	$("#likesText").html(upScore);
	$("#dislikesText").html(downScore);
});

socket.on('updateRoundScores', function(dj1Scores, dj2Scores) {
	$("#dj1Round1VoteCount").html(dj1Scores[0]);
	$("#dj1Round2VoteCount").html(dj1Scores[1]);
	$("#dj1Round3VoteCount").html(dj1Scores[2]);

	$("#dj2Round1VoteCount").html(dj2Scores[0]);
	$("#dj2Round2VoteCount").html(dj2Scores[1]);
	$("#dj2Round3VoteCount").html(dj2Scores[2]);

});

socket.on('gameOver', function(dj1Score, dj2Score, dj1, dj2) {
	$("audio").trigger("pause");
	if(dj1Score > dj2Score) {
		alert(dj1.clientName + " is Victorious with a score of: " + dj1Score);
	} else if(dj2Score > dj1Score) {
		alert(dj2.clientName + " is Victorious with a score of: " + dj2Score);
	} else {
		alert("The Djs Went Toe to Toe, and no Victor has emerged.")
	}

	$('#rdioPlayer').css('display','block');
	if(apiswf != null) {
		bPlayingSong = true;
  		apiswf.rdio_play();
  	}
});

socket.on('updateUserList', function(users) {
	$('#userList').empty();
	console.log(users);
	for(var i=0; i<users.length; i++) {
		$('#userList').append("<li class='list-group-item'>" + users[i].clientName + "<br/></li>");
	}
});

socket.on('updateChat', function(sender, data) {
	$('#chatBox').append('<b>'+sender + ':</b> ' + data + '<br>');
});

function playFile(file, startTime) {
  $('audio').attr("src", file );
  $('#rdioPlayer').css('display','none');
  playStart = startTime;
  if(apiswf != null) {
  	apiswf.rdio_pause();
  }
}

window.setInterval(function() {
    playStart = playStart + 1.0;
}, 1000);
