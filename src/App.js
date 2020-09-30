import React, { useState, useEffect } from 'react';
import {ReactFlvPlayer} from 'react-flv-player'

let recorder;
  var mediaStream;
  var fileName;
  var connection;
  const constraints = window.constraints = {
    audio: true,
    video: true
  };
  var videoTracks;
  var audioTracks;
function App () {
  
  const [openCamera, setopenCamera] = useState(false);


  useEffect(() => {
    notExit();
    return () => {
      return
    }
  }, [])

  function notExit(){
    window.onbeforeunload = function(){
      return 'Are you sure you want to leave?';
    };
  }

  async function startCamera(){
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if(stream){
        setopenCamera(true)
        handleSuccess(stream);
        getWebSocket();
      }
    } catch (e) {
      handleError(e);
    }
  }
  async function handleSuccess(stream){
    const video = document.querySelector('video');
    videoTracks = stream.getVideoTracks();
    audioTracks = stream.getAudioTracks();
    window.stream = stream; // make variable available to browser console
    mediaStream = stream;
    video.srcObject = stream;
    getRecorder();
  }

  function getRecorder() {
    var options = { mimeType: 'video/mp4', audioBitsPerSecond: 128000 };
    recorder =  new MediaRecorder(mediaStream, options);
    console.log(recorder)
    recorder.ondataavailable = videoDataHandler;
  };

  function videoDataHandler(event) {
      var reader = new FileReader();
      reader.readAsArrayBuffer(event.data);
      reader.onloadend = function (event) {
        console.log(reader.result);
          connection.send(reader.result);
      };
  };

  function getWebSocket() {
    const modelId = 8; //this.getModelId()
    const socket=`wss://test.socialtechapps.com/?modelId=${modelId}`;
    var websocketEndpoint = socket;
    connection = new WebSocket(websocketEndpoint);
    connection.binaryType = 'arraybuffer';
    connection.onmessage = function (message) {
        fileName = message.data;
        console.log(fileName);
      }
  };


  function handleError(error) {
    if (error.name === 'ConstraintNotSatisfiedError') {
      const v = constraints.video;
      errorMsg(`The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`);
    } else if (error.name === 'PermissionDeniedError') {
      errorMsg('Permissions have not been granted to use your camera and ' +
        'microphone, you need to allow the page access to your devices in ' +
        'order for the demo to work.');
    }
    errorMsg(`getUserMedia error: ${error.name}`, error);
  }

  function errorMsg(msg, error) {
    if (typeof error !== 'undefined') {
      console.error(error);
    }
  }

  function startTransmition(){
    recorder.start(1000);
  }
  function stopTransmistion(){
    videoTracks[0].stop();
    audioTracks[0].stop();
    recorder.stop();
    connection.close(1000);
    setopenCamera(false);
  }
    return (
      <div >
        {/* <ReactFlvPlayer
          url = "https://test.socialtechapps.com/hls/casa.flv"
          heigh = "800px"
          width = "800px"
          isMuted={true}
        /> */}

        {!openCamera?(
          <div>
            <button onClick={() => startCamera()}>Open Camera</button>
          </div>
        ):(
          <div>
          <video  id="video" autoPlay playsInline muted></video>
          <button onClick={() => startTransmition()}>Start transmition</button>
          <button onClick={() => stopTransmistion()}>Stop transmitión</button>
          </div>
        )}
      </div>
    );
}

export default App;