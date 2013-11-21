var server = require('http').createServer(function(req, res) {
	var url_parts = require('url').parse(req.url, true);
	var query = url_parts.query;
	console.log("POST: " + query);
	if(query.type == "vote") {
		if(query.v == '1') {
			voteUpID();
		} else if(query.v == '-1') {
			voteDownID();
		}
	}
}).listen(8080),
	io = require('socket.io').listen(server,  {log: false}),
	dl = require('delivery'),
	fs = require('fs');

var activeFile;
var dj1queuedFile;
var dj2queuedFile;
var roundStartTime;

var clients = [];

var dj1 = null;
var dj2 = null;

var activeDJ = null;

var bPlaying = false;
var bFirstRound = true;

var currentRound = 0;
var dj1Scores = [];
var dj2Scores = [];
var upvoters = [];
var downvoters = [];

var dj1total = 0;
var dj2total = 0;

var upVote = 0;
var downVote = 0;

io.sockets.on('connection', function(socket) {
	var delivery = dl.listen(socket);
	
	updateScore();
	updateRoundScores();
	socket.emit('updateDjs', dj1, dj2, activeDJ, activeFile);

	if(roundStartTime != null) {
		socket.emit('nextSong', (new Date() / 1000) - roundStartTime, "http://192.241.169.33:8010/LiveDJ_Node/songs/"+encodeURIComponent(activeFile));
	}

	delivery.on('receive.success', function(file) {
		console.log("File Recieved!");
		fs.writeFile('songs/' + file.name,file.buffer, function(err){
	      if(err){
	        console.log('File could not be saved.');
	      }else{
        	if(socket.playerInfo == dj1) {
        		dj1queuedFile = file.name;
			} else if(socket.playerInfo == dj2) {
        		dj2queuedFile = file.name;
			}

			if(!bPlaying && dj1 != null && dj2 != null) {
				if((activeDJ == dj1 && dj1queuedFile != null) || (activeDJ == dj2 && dj2queuedFile != null)) {
					bPlaying = true;
					nextRound();
				}
			}
	      };
	    });
	});

	socket.on('initClient', function(playerInfo) {
		clients.push(playerInfo);
		socket.playerInfo = playerInfo;
		io.sockets.emit('updateUserList', clients);
		io.sockets.emit('updateChat', socket.playerInfo.clientName, socket.playerInfo.clientName + " has Connected!");
	});

	socket.on('testPost', function(data) {
		console.log("TEST: " + Data);
	});

	socket.on('disconnect', function() {
		for(var i=0; i<clients.length; i++) {
			if(clients[i] == socket.playerInfo) {
				delete clients[clients[i]];
			}
		}

		for(var i in clients) {
			if(clients[i] == socket.playerInfo) {
				clients.splice(i, 1);
			}
		}
		playerDisconnected(socket.playerInfo);
	});

	function playerDisconnected(playerInfo) {
		if(playerInfo == null) {return;}
		for(var i=0; i<upvoters.length; i++) {
			if(upvoters[i] == playerInfo.clientName) {
				upvoters.splice(i, 1);
			}
		}

		for(var i=0; i<downvoters.length; i++) {
			if(downvoters[i] == playerInfo.clientName) {
				downvoters.splice(i, 1);
			}
		}

		if(dj1 != null && dj1.clientName == playerInfo.clientName) {
			if(dj1 == activeDJ) {
				activeDJ = dj2;
				stopActiveSong();
			}
			dj1 = null;

		}
		if(dj2 != null && dj2.clientName == playerInfo.clientName) {
			if(dj2 == activeDJ) {
				activeDJ = dj1;
				stopActiveSong();
			}
			dj2 = null;
		}

		if((dj1 == null || dj2==null) && bPlaying) {
			gameEnd();
		}
		io.sockets.emit('updateUserList', clients);
		updateDJs();
	}

	socket.on('tryBecomeDJ', function(djNumber) {
		console.log("Trying to become: " + djNumber);
		if(djNumber == 1 && socket.playerInfo != dj2) {
			if(dj1 == null) {
				dj1 = socket.playerInfo;
				if(activeDJ == null) {
					activeDJ = dj1;
				}
			}
		} else if(djNumber == 2) {
			if(dj2 == null && socket.playerInfo != dj1) {
				dj2 = socket.playerInfo;
				if(activeDJ == null) {
					activeDJ = dj2;
				}
			}
		}

		if(dj1 != null && dj2 != null) {
			if((activeDJ == dj1 && dj1queuedFile != null) || (activeDJ == dj2 && dj2queuedFile != null)) {
				bPlaying = true;
				nextRound();
			}
		}

		updateDJs();
	});

	socket.on('voteUp', function(playerName) {
		voteUp(playerName);
	});

	socket.on('voteDown', function(playerName) {
		voteDown(playerName);
	});

	

	socket.on('sendChat', function(data) {
		io.sockets.emit('updateChat', socket.playerInfo.clientName, data);
	});
});

function stopActiveSong() {
	roundStartTime	= null;
	activeFile = null;
	updateDJs();
}

function updateDJs() {
	io.sockets.emit('updateDjs', dj1, dj2, activeDJ, activeFile);
}

function updateScore() {
	io.sockets.emit('updateScore', upvoters.length + upVote, downvoters.length + downVote);
}

function updateRoundScores() {
	io.sockets.emit('updateRoundScores', dj1Scores, dj2Scores);
}

function nextRound() {
	roundStartTime = new Date().getTime() / 1000;
	if(activeDJ	== dj1) {
		activeFile = dj1queuedFile;
		dj2Scores[currentRound] = (upvoters.length + upVote) - (downVote + downvoters.length);
		dj2total += dj2Scores[currentRound];
	} else {
		activeFile = dj2queuedFile;
		dj1Scores[currentRound] = (upvoters.length + upVote) - (downVote + downvoters.length);
		dj1total += dj1Scores[currentRound];
	}
	if(dj1Scores.length == dj2Scores.length) {
		currentRound++;
	}

	if(bFirstRound)
	{
		dj1Scores = [];
		dj2Scores = [];
		bFirstRound = false;
	}
	upvoters = [];
	downvoters	= [];
	upVote = 0;
	downVote = 0;
	updateScore();
	updateRoundScores();
	updateDJs();
	
	if(currentRound == 3) {
		gameEnd();
	} else {
		io.sockets.emit('nextSong', (new Date() / 1000) - roundStartTime, "http://192.241.169.33:8010/LiveDJ_Node/songs/"+encodeURIComponent(activeFile));
	}
}

function gameEnd() {
	currentRound = 0;
	stopActiveSong();
	bPlaying = false;

	io.sockets.emit('gameOver', dj1total, dj2total, dj1, dj2);
	
	activeFile = null;
	dj1queuedFile = null;
	dj2queuedFile = null;
	roundStartTime = null;

	dj1 = null;
	dj2 = null;

	activeDJ = null;

	bFirstRound = true;

	currentRound = 0;
	dj1Scores = [];
	dj2Scores = [];
	upvoters = [];
	downvoters = [];
	upVote = 0;
	downVote = 0;
	dj1total = 0;
	dj2total = 0;
	updateScore();
	updateRoundScores();
}

setInterval(function() {
	if(bPlaying) {
		if((new Date() / 1000) - roundStartTime > 60) {
			if(activeDJ == dj1) {
				activeDJ = dj2;
			} else {
				activeDJ = dj1;
			}
			nextRound();
		}

		io.sockets.emit('resync', (new Date() / 1000) - roundStartTime);
	}
}, 2000);

function voteUp(playerName) {
	if(!bPlaying) {return;}
	for(var i=0;i < upvoters.length; i++) {
		if(upvoters[i] == playerName) {
			return;
		}
	}

	for(var i=0; i<downvoters.length; i++) {
		if(downvoters[i] == playerName) {
			downvoters.splice(i, 1);
		}
	}

	upvoters.push(playerName);
	updateScore();
}

function voteDown(playerName) {
	if(!bPlaying) {return;}
		for(var i=0;i < downvoters.length; i++) {
			if(downvoters[i] == playerName) {
				return;
			}
		}

		for(var i=0; i<upvoters.length; i++) {
			if(upvoters[i] == playerName) {
				upvoters.splice(i, 1);
			}
		}

		downvoters.push(playerName);
		updateScore();
}

function voteUpID() {
	console.log("Vote Up!");
	upVote++;
	updateScore();
}

function voteDownID() {
	downVote++;
	updateScore();
}