var autoPlay = true;
// undefined will show or hide field by video duration
var alwaysShowHour = undefined;
var alwaysShowMinute = undefined;
var alwaysShowSecond = true;
var alwaysShowMS = false;
var highVolumeClass = "fa-volume-up";
var lowVolumeClass = "fa-volume-down";

var createPlayer  = function() {
  throw("this function not working");

  var video = document.createElement("video");
  document.body.appendChild(video);
}

var player = function(containerID,files,config) {
  // for internal access
  var playlist = [];
  var DOMs = {};

  var playStatus = {
    buffering: false,
    playlistIndex: 0,
    dragging: false,
    playSpeed: 1,
    durationInfo: {
      hour: alwaysShowHour,
      minute: alwaysShowMinute,
      second: alwaysShowSecond,
      ms: alwaysShowMS
    }
  };


  // public access function
  // debug using
  this.DOMs = DOMs;
  this.playStatus = playStatus;
  this.playlist = playlist;

  // must public
  var setSpeed = function(speed) {
    playStatus.playSpeed = speed;
    DOMs.video.playbackRate = speed;
    DOMs.speedInfo.innerHTML = DOMs.video.playbackRate;
  }
  this.setSpeed = setSpeed;

  var setVolumeOnchange = function(event) {
    console.log(event);
    var volume = event.target.value;
    setVolume(volume);
  }
  this.setVolumeOnchange = setVolumeOnchange;

  var setVolume = function(volume) {
    DOMs.video.volume = volume;
  }
  this.setVolume = setVolume;

  var setMute = function(mute) {
    if (mute) {
      DOMs.video.muted = 1;
    } else {
      DOMs.video.muted = 0;
    }
  }
  this.setMute = setMute;

  var unattend = 1;  // prettify code
  var current = 2;
  var playVideo = function(mode) {
    if (mode==unattend && !autoPlay) {
      return 0;
    }
    if (mode==current && DOMs.video.paused) {
      return 0;
    }
    showPauseOrPlay(pauseButton);
    DOMs.video.play();
  }
  this.playVideo = playVideo;

  var pauseVideo = function() {
    showPauseOrPlay(playButton);
    DOMs.video.pause();
  }
  this.pauseVideo = pauseVideo;

  var stopVideo = function() {
    showPauseOrPlay(playButton);
    resetEnv();
  }
  this.stopVideo = stopVideo;

  var fullscreen = function() {
    var elem = DOMs.video;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  }
  this.fullscreen = fullscreen;

  var shiftFiles = function(files) {
    if (files===undefined) {
      console.err("no files input");
    }
    var targetFileIndex = playStatus.playlistIndex + files;
    var currentFileIndex = playStatus.playlistIndex;
    if (targetFileIndex<0) {
      if (currentFileIndex==0) {
        shiftTimes("HEAD");
      } else {
        console.warn("no enough file to shift");
      }
    } else if (targetFileIndex+1 > playlist.length) {
      if (currentFileIndex+1==playlist.length) {
        shiftTimes("END");
      } else {
        console.warn("no enough file to shift");
      }
    } else {
      shiftToFile(targetFileIndex);
    }
  }
  this.shiftFiles = shiftFiles;

  var shiftToFile = function(fileIndex) {
    playStatus.playlistIndex = fileIndex;
    loadVideo();
    playVideo(current);
  }

  var shiftTimes = function(second) {
    var shiftSconed = second;
    if (shiftSconed=="END") {
      shiftToTime(DOMs.video.duration);
    } else if (shiftSconed=="HEAD") {
      shiftToTime(0);
    } else {
      DOMs.video.currentTime += shiftSconed;
    }
  }
  this.shiftTimes = shiftTimes;

  var shiftToTime = function(timePos) {
    DOMs.video.currentTime = timePos;
  }
  this.shiftToTime = shiftToTime;

  // event actions (most private)
  var videoErrorAction = function(event) {
  
    // error code here: http://www.w3schools.com/tags/av_prop_error.asp
    var error = event.target.error;
    switch (event.target.error.code) {
     case error.MEDIA_ERR_ABORTED:
       alert('MEDIA_ERR_ABORTED');
       break;
     case error.MEDIA_ERR_NETWORK:
       alert('MEDIA_ERR_NETWORK');
       break;
     case error.MEDIA_ERR_DECODE:
       alert('MEDIA_ERR_DECODE');
       break;
     case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
       alert('MEDIA_ERR_SRC_NOT_SUPPORTED');
       break;
     default:
       alert('An unknown error occurred.');
       break;
    }
    //resetEnv();
  }

  var videoVolumechangeAction = function(event) {
    var volume = event.target.volume;
    if (event.target.muted==true) {
      volume = 0;
    }
    //console.log("volume changed to ", volume);

    if (volume==0) {
      showMuteOrUnmute(unmuteButton);
    } else {
      showMuteOrUnmute(muteButton);
    }
    updateVolumebarPos(volume);

    if (volume>=0.5) {
      updateVolumeIcon(true);
    } else {
      updateVolumeIcon(false);
    }
  }

  var seekbarInputAction = function(event) {
    playStatus.dragging = true;
  }

  var seekbarChangeAction = function(event) {
    playStatus.dragging = false;
    var seekbarValue = event.target.value;
    var videoTime = DOMs.video.duration * seekbarValue;
    DOMs.video.currentTime = videoTime;
  }

  var videoLaddedmetadataAction = function(event) {
    var duration = DOMs.video.duration;
    updateDurationInfo(formatTimeString(duration,true));
    //playlist[playStatus.playlistIndex].duration = duration;
    //console.log("meta loaded",duration);
  }

  var videoTimeupdateAction = function(event) {
    if (playStatus.dragging===true) {
      return 0;
    }
    try {
      var duration = DOMs.video.duration;
      var position = event.target.currentTime;
      var positionString = formatTimeString(position);
      updatePositionInfo(positionString);
      var seekbarValue = position / duration;
      updateSeekbarPos(seekbarValue);
    } catch (e) {
      console.warn("unable to update video time");
    }
  }

  var videoProgressAction = function(event) {
    console.log("download some content");
  }

  // on play only works on resume from pause
  var videoPlayAction = function(event) {
    // seekbar updater
    //playStatus.checkTimer = setInterval(checkTimerAction,100);
  }

  // onplaying works on anything that resume playing like buffered
  var videoPlayingAction = function(event) {
    if (playStatus.buffering) {
      showLoadingHintDisplay(false);
    }
    // seekbar updater
    //playStatus.checkTimer = setInterval(checkTimerAction,100);
  }

  var videoPauseAction = function(event) {
    //clearInterval(playStatus.checkTimer);
  }

  var videoEndAction = function(event) {
    playStatus.playlistIndex += 1;
    if (playStatus.playlistIndex < playlist.length) {
      loadVideo();
      setSpeed(playStatus.playSpeed);
      playVideo(unattend);
    } else {
      console.log("ended");
    }
  }

  var loadingAction = function() {
    showLoadingHintDisplay(true);
    playStatus.buffering = true;
  };

  var loadVideo = function() {
    DOMs.video.src = playlist[playStatus.playlistIndex].file;
  }

  // low level functions
  var updateVolumebarPos = function(volume) {
    DOMs.volumebar.value = volume;
  }
  var hight = true;
  var low = false;
  var updateVolumeIcon = function(hightOrLow) {
    if (hightOrLow) {
      if (!checkClass(DOMs.mute,highVolumeClass)) {
        removeClass(DOMs.mute,lowVolumeClass);
        appendClass(DOMs.mute,highVolumeClass);
        console.log("change icon")
      }
    } else {
      if (!checkClass(DOMs.mute,lowVolumeClass)) {
        removeClass(DOMs.mute,highVolumeClass);
        appendClass(DOMs.mute,lowVolumeClass);
        console.log("change icon")
      }
    }
  }
  var updateSeekbarPos = function(seekbarValue) {
    DOMs.seekbar.value = seekbarValue;
  }
  var updateDurationInfo = function(value) {
    DOMs.durationInfo.innerHTML = value;
  }
  var updatePositionInfo = function(value) {
    DOMs.positionInfo.innerHTML = value;
  }
  var showLoadingHintDisplay = function(show) {
    showHideDOM(show,DOMs.loadingHint);
  }
  var playButton = true;
  var pauseButton = false;
  var showPauseOrPlay = function(button) {
    if (button) {
      showPauseBtn(false);
      showPlayBtn(true);
    } else {
      showPauseBtn(true);
      showPlayBtn(false);
    }
  }
  var muteButton = true;
  var unmuteButton = false;
  var showMuteOrUnmute = function(button) {
    if (button) {
      showMuteBtn(true);
      showUnmuteBtn(false);
    } else {
      showMuteBtn(false);
      showUnmuteBtn(true);
    }
  }
  var showMuteBtn = function(show) {
    showHideDOM(show,DOMs.mute);
  }
  var showUnmuteBtn = function(show) {
    showHideDOM(show,DOMs.unmute);
  }
  var showPauseBtn = function(show) {
    showHideDOM(show,DOMs.pause);
  }
  var showPlayBtn = function(show) {
    showHideDOM(show,DOMs.play);
  }
  var showHideDOM = function(show,DOM) {
    if (show) {
      DOM.style.display="";
    } else {
      DOM.style.display="none";
    }
  }

  var resetEnv = function() {
    playStatus.playlistIndex = 0;
    loadVideo();
    setTimeout(function() {
      DOMs.seekbar.value = 0;
    },100);
    playStatus = {
      buffering: false,
      playlistIndex: 0,
      dragging: false,
      playSpeed: 1,
      durationInfo: {
        hour: alwaysShowHour,
        minute: alwaysShowMinute,
        second: alwaysShowSecond,
        ms: alwaysShowMS
      }
    }
    //DOMs.video.currentTime = 0;
  }
  var formatTimeString = function(time,updateDurationState) {
    var timeObject = formatTime(time,updateDurationState);
    var returnString = ""
    
    if (playStatus.durationInfo.ms===true) {
      returnString = "." + leftpad(timeObject.ms,3,"0");
    }

    if (playStatus.durationInfo.second) {
      returnString = leftpad(timeObject.second,2,"0") + returnString;
    }

    if (playStatus.durationInfo.minute) {
      returnString = leftpad(timeObject.minute,2,"0") + ":" + returnString;
    }

    if (playStatus.durationInfo.hour) {
      returnString = leftpad(timeObject.hour,2,"0") + ":" + returnString;
    }

    return returnString;
  }
  this.formatTimeString = formatTimeString;
  var formatTime = function(time,updateState) {
    var timeObject = {};
    var durationInfo = playStatus.durationInfo;

    // format second to second + ms
    timeObject.ms = time % 1;
    timeObject.second = time - timeObject.ms;

    // javascript will make 0.1 to 0.1000000000003638
    timeObject.ms = Math.round(timeObject.ms*1000);

    // format second to minute + second
    timeObject.minute = Math.floor(timeObject.second / 60 );
    timeObject.second = timeObject.second % 60;
    if (updateState && timeObject.minute>0 && durationInfo.minute === undefined) {
      durationInfo.minute = true;
    }

    // format minute to hour + minute
    timeObject.hour = Math.floor(timeObject.minute / 60 );
    timeObject.minute = timeObject.minute % 60;
    if (updateState && timeObject.hour>0 && durationInfo.hour === undefined) {
      durationInfo.hour = true;
    }
    return timeObject;
  }
  this.formatTime = formatTime;
  var leftpad = function(value,digital,prefix) {
    var string = value.toString();
    while (string.length < digital) {
      string = prefix.toString() + string;
    }
    return string;
  }

  // low as jQuery
  var checkClass = function(DOM,classToFind) {
    var classes = DOM.className;
    if (classes.search(classToFind)==-1) {
      return false;
    } else {
      return true;
    }
  }
  var removeClass = function(DOM,classToReomve) {
    var classes = DOM.className;
    var newClasses = classes.replace(classToReomve,"");

    DOM.className = newClasses;
  }

  var appendClass = function(DOM,classToAppend) {
    var classes = DOM.className + classToAppend.toString() ;

    DOM.className = classes;
  }

  // inits
  var initDOMs = function() {
    // find doms
    DOMs.container = document.getElementById(containerID);
    DOMs.video = DOMs.container.getElementsByTagName("video")[0];
    DOMs.speedInfo = DOMs.container.getElementsByClassName("speed-content")[0];
    DOMs.durationInfo = DOMs.container.getElementsByClassName("duration-content")[0];
    DOMs.positionInfo = DOMs.container.getElementsByClassName("position-content")[0];
    DOMs.loadingHint = DOMs.container.getElementsByClassName("loading-hint")[0];
    DOMs.seekbar = DOMs.container.getElementsByClassName("seekbar")[0];
    DOMs.volumebar = DOMs.container.getElementsByClassName("volumebar")[0];
    DOMs.pause = DOMs.container.getElementsByClassName("pause")[0];
    DOMs.play = DOMs.container.getElementsByClassName("play")[0];
    DOMs.stop = DOMs.container.getElementsByClassName("stop")[0];
    DOMs.fullscreen = DOMs.container.getElementsByClassName("fullscreen")[0];
    DOMs.mute = DOMs.container.getElementsByClassName("mute")[0];
    DOMs.unmute = DOMs.container.getElementsByClassName("unmute")[0];
    DOMs.previous = DOMs.container.getElementsByClassName("previous")[0];
    DOMs.next = DOMs.container.getElementsByClassName("next")[0];
    DOMs.backward = DOMs.container.getElementsByClassName("backward")[0];
    DOMs.forward = DOMs.container.getElementsByClassName("forward")[0];
    showPauseOrPlay(playButton);
    showMuteOrUnmute(muteButton);
  }
  var initDOMsValue = function() {
    DOMs.speedInfo.innerHTML = DOMs.video.playbackRate;
  }
  var initPlayer = function() {
    // setup player
    DOMs.video.controls = config.defaultControls;
    DOMs.video.style.width = config.playerWidth;
    DOMs.video.style.height = config.playerHeight;

    // setup player file
    for (index in files) {
      playlist.push({file: files[index]});
    }
  }
  var initPlayerEvents = function() {
    DOMs.video.onwaiting = loadingAction;
    DOMs.video.onended = videoEndAction;
    DOMs.video.onplay = videoPlayAction;
    DOMs.video.onplaying = videoPlayingAction;
    DOMs.video.onpause = videoPauseAction;
    DOMs.video.onprogress = videoProgressAction;
    DOMs.video.ontimeupdate = videoTimeupdateAction;
    DOMs.video.onloadedmetadata = videoLaddedmetadataAction;
    DOMs.video.onerror = videoErrorAction;
    DOMs.video.onvolumechange = videoVolumechangeAction;
  }
  var initButtonEvent = function() {
    DOMs.pause.onclick = pauseVideo;
    DOMs.play.onclick = playVideo;
    DOMs.stop.onclick = stopVideo;
    DOMs.fullscreen.onclick = fullscreen;
    DOMs.mute.onclick = function() {setMute(true)};
    DOMs.unmute.onclick = function() {setMute(false)};
    DOMs.previous.onclick = function() {shiftFiles(-1)};
    DOMs.next.onclick = function() {shiftFiles(1)};
    DOMs.backward.onclick = function() {shiftTimes(-1)};
    DOMs.forward.onclick = function() {shiftTimes(1)};
    DOMs.seekbar.oninput = seekbarInputAction;
    DOMs.seekbar.onchange = seekbarChangeAction;
    DOMs.volumebar.oninput = setVolumeOnchange;
    DOMs.volumebar.onchange = setVolumeOnchange;
  }

  // constractor here
  initDOMs();
  initDOMsValue();
  initPlayerEvents();
  initPlayer();
  initButtonEvent();

  loadVideo();
  playVideo(unattend);
}
