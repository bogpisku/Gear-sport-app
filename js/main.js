window.onload = function() {
    // TODO:: Do your initialization job

    // add eventListener for tizenhwkey
    document.addEventListener('tizenhwkey', function(e) {
        if (e.keyName === "back") {
            try {
                tizen.application.getCurrentApplication().exit();
            } catch (ignore) {}
        }
    });

    //Sensors ACCELERATION,GRAVITY,LINEAR_ACCELERATION,GYROSCOPE
    var gyroSensor = tizen.sensorservice.getDefaultSensor('GYROSCOPE');
    var gravSensor = tizen.sensorservice.getDefaultSensor('GRAVITY');
    var accSensor = tizen.sensorservice.getDefaultSensor('ACCELERATION');
    var laccSensor = tizen.sensorservice.getDefaultSensor('LINEAR_ACCELERATION');
    //SERVER CONNECTION
    var webSocketUrl = 'ws://192.168.1.73:8080/socket.io/?EIO=3&transport=websocket';
    var webSocket;

    // Sample code
    var textbox = document.querySelector('.contents');
    textbox.addEventListener("click", function() {
        var contentText = document.querySelector('#textbox');
        if (contentText.innerHTML === "Start") {
            //Start services
        	contentText.innerHTML = "Stop";
        	connectionToServer(true);
        	screenLock(true);
        	active_deactiveServices(true);
        } else {
            //Stop services
        	contentText.innerHTML = "Start";
        	connectionToServer(false);
        	screenLock(false);
        	active_deactiveServices(false);
        }
    });
    /////Handle the connection to the server
    function connectionToServer(socketConnect) {
        var contentText = document.querySelector('#serverConnection');
        if (socketConnect) {
            webSocket = new WebSocket(webSocketUrl);
            /* If the connection is established */
            webSocket.onopen = function(e) {
                console.log('connection open, readyState: ' + e.target.readyState);

                contentText.innerHTML = "Connected";
            };

            /* If the connection fails or is closed with prejudice */
            webSocket.onerror = function(e) {
                /* Error handling */
                console.log(e);
                contentText.innerHTML = "Error";
            };
            webSocket.onclose = function(e) {
                console.log('connection close, readyState: ' + e.target.readyState);
                contentText.innerHTML = "Closed";
            };
        } else {
            if (webSocket.readyState === 1) {
                webSocket.close();
            }
        }
    }
    ///////Send Message to server
    function sendMessage(msg) {
        if (webSocket.readyState === 1) {
            webSocket.send(msg);
        }
    }
    
    /////Handle the screen activation
    function screenLock(lockscreen){
    	if(lockscreen){
        	tizen.power.request("SCREEN", "SCREEN_NORMAL");
        }else{
        	tizen.power.release("SCREEN");
        }
    }
    //////Handle the sensors activation
    function active_deactiveServices(activate) {
        if (activate){
        	//gyroscope sensor
        	gyroSensor.start(OnsuccessCB);
            gyroSensor.setChangeListener(gyroOnchangedCB, 400);
            //gravity sensor
            gravSensor.setChangeListener(gravOnchangedCB, 100);
            gravSensor.start(OnsuccessCB);
            //acclerometor sensor
            accSensor.setChangeListener(accOnchangedCB, 100);
            accSensor.start(OnsuccessCB);
            //linear accelerometer sensor
            laccSensor.setChangeListener(laccOnchangedCB, 100);
            laccSensor.start(OnsuccessCB);
        }else{
        	console.log('Stopping  sensors service');
            gyroSensor.unsetChangeListener();
            gyroSensor.stop();
            gravSensor.unsetChangeListener();
            gravSensor.stop();
        }
    	
    }
    //ON success sensor connection
    function OnsuccessCB() {
        console.log("Sensor start");
    }
    
  //LISTENER TO GET DATA
    function gyroOnchangedCB(sensorData) {
        //Send Data to server
        sendMessage("{\"type\":\"gyro\",\"data\":{\"x\":"+sensorData.x.toFixed(8)+",\"y\":"+sensorData.y.toFixed(8)+",\"z\":"+sensorData.z.toFixed(8)+"}}");
        
    }
    function gravOnchangedCB(sensorData) {
        sendMessage("{\"type\":\"grav\",\"data\":{\"x\":"+sensorData.x.toFixed(8)+",\"y\":"+sensorData.y.toFixed(8)+",\"z\":"+sensorData.z.toFixed(8)+"}}");
    }
    function accOnchangedCB(sensorData) {
        sendMessage("{\"type\":\"acc\",\"data\":{\"x\":"+sensorData.x.toFixed(8)+",\"y\":"+sensorData.y.toFixed(8)+",\"z\":"+sensorData.z.toFixed(8)+"}}");
    }
    function laccOnchangedCB(sensorData) {
        sendMessage("{\"type\":\"lacc\",\"data\":{\"x\":"+sensorData.x.toFixed(8)+",\"y\":"+sensorData.y.toFixed(8)+",\"z\":"+sensorData.z.toFixed(8)+"}}");
    }
    

};