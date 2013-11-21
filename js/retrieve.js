var playStart = 0;

var update = true;
$(function(){
  $('audio').bind('timeupdate', function() {
    if(update || Math.abs(this.currentTime - playStart) > 2) {
      this.currentTime = playStart;
      update = false;
    }
  })

  var socket = io.connect('http://162.243.61.109:8080/');

  var roundStart = null;
  var startTime = 0;

  socket.on('connect', function(){
    console.log("Connected!");
  });

  socket.on('nextSong', function(startTime, nextFile) {
    console.log("Socket Says Next Song!: " + startTime);
    playFile(nextFile, startTime);
  });

  socket.on('resync', function(startTime) {
    console.log(startTime);
    playStart = startTime;
    update = true;
  });


});

window.setInterval(function() {
    console.log("hi");
    playStart = playStart + 1.0;
}, 1000);

function playFile(file, startTime) {
  $('audio').attr("src", file );
  playStart = startTime;
  update = true;
}

//yellowpencil

