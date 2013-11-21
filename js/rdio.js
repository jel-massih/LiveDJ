// a global variable that will hold a reference to the api swf once it has loaded
var apiswf = null;

var bPlayingSong = false;

$(document).ready(function() {
  // on page load use SWFObject to load the API swf into div#apiswf
  var flashvars = {
    'playbackToken': "GA5SjDH5_____2R2cHlzNHd5ZXg3Z2M0OXdoaDY3aHdrbmplbC1tYXNzaWguY29t8zAHFExZ6Zi8WxWUrdxj1Q==", // from token.js
    'domain': "jel-massih.com", // from token.js
    'listener': 'callback_object' // the global name of the object that will receive callbacks from the SWF
    };
  var params = {
    'allowScriptAccess': 'always'
  };
  var attributes = {};
  swfobject.embedSWF('http://www.rdio.com/api/swf/', // the location of the Rdio Playback API SWF
      'apiswf', // the ID of the element that will be replaced with the SWF
      1, 1, '9.0.0', 'expressInstall.swf', flashvars, params, attributes);
});


var callback_object = {};

callback_object.ready = function ready(user) {
  // Called once the API SWF has loaded and is ready to accept method calls.

  // find the embed/object element
  apiswf = $('#apiswf').get(0);
  apiswf.rdio_play("p19994");
  apiswf.rdio_setShuffle(true);
  $('#art').click(function() { if(bPlayingSong) {apiswf.rdio_pause(); bPlayingSong = false;} else{apiswf.rdio_play(); bPlayingSong = true;} });
  $('#prev_track').click(function() { apiswf.rdio_previous(); });
  $('#next_track').click(function() { apiswf.rdio_next(); });
}

callback_object.playingTrackChanged = function playingTrackChanged(playingTrack, sourcePosition) {
  // The currently playing track has changed.
  // Track metadata is provided as playingTrack and the position within the playing source as sourcePosition.
  if (playingTrack != null) {
    $('#track').text(playingTrack['name']);
    $('#artist').text(playingTrack['artist']);
    $('#art').attr('src', playingTrack['icon']);
  }
}

callback_object.playStateChanged = function playStateChanged(playState) {
  // The state can be: 0 - paused, 1 - playing, 2 - stopped, 3 - buffering or 4 - paused.

  if(!bPlayingSong) {
    apiswf.rdio_pause();
  }
}

