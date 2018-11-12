/*
Robot methods available when board is ready:
getAngles() - returns current angles
setAngles(t1,t2,t3) - Sets angles
getPosition() - returns current position
resetPosition() - sets position to restpoint
getPositionForAngles(t1,t2,t3) - returns calculated position for given angles
getAnglesForPosition(x,y,z) - return calculated angles for given position
getPositionForscreen(x,y) - calculates position to reach given screen coordinates
getContactZ() - returns minimum Z index that reaches screen
tap(screenX, screenY, cb) - taps screen at given coordinates
swipe(startX, startY, endX, endY, cb) - swipes
sendKeys(keys, cb) - types keyboard keys
startDancing() - lets dance
stopDancing() - no dance
getCalibrationData() - returns calibration data
setCalibrationData(newData) - updates calibration data
*/


exports = module.exports = function(io, robot, config, servo1, servo2, servo3) {

    fs = require("fs");

    var calibratingInProgress = false;
    var touched = false;
    var tX, tY; // last touched screen values

    function getInfo() {
        // nosūta info par serveri un konfigurāciju
        data = {};
        data.ip = ip;
        data.config = config;
        data.calibration = robot.getCalibrationData();
        data.contactz = robot.getContactZ();
        return data;
    }

    var lowerAndCheckForContact = function(x, y, currentZ, cb) {
        if (!calibratingInProgress) return;
        ret = {};
        if (!touched) {
            z = z - 1;
            if (z < config.boundary_z.min) {
                console.log('Reached minimum height: '+config.boundary_z.min+', aborting calibration!');
                robot.resetPosition();
                ret.status = 0;
                cb(ret);
            } else {
                // process.stdout.write(" "+z);
                robot.setPosition(x, y, z);
                setTimeout(
                    function() {
                        return lowerAndCheckForContact(x, y, z, cb);
                    }, 100);
            }
        } else {
            // console.log('reached point 1: ' + robot.getPosition());
            ret.status = 1;
            ret.position = robot.getPosition();
            ret.screen = [tX, tY];
            cb(ret);
        }
    };


    function startCalibration() {
        if (calibratingInProgress) return;

        var cal = robot.getCalibrationData();

        x = 0, y = 0;
        z = config.defaultHeight;

        calibratingInProgress = true;
        touched = false;
        console.log('Starting calibration (Fail safe height: '+config.boundary_z.min+')');

        lowerAndCheckForContact(x, y, z, function(ret) {
            console.log('Calibrated point 1/3 ' + JSON.stringify(ret));
            robot.resetPosition();
            if (!ret.status) return;
            cal.p1.position.x = ret.position[0];
            cal.p1.position.y = ret.position[1];
            cal.p1.position.z = ret.position[2];
            cal.p1.screen.x = ret.screen[0];
            cal.p1.screen.y = ret.screen[1];

            setTimeout(
                function() {
                    x = 0, y = config.calWidth; z = config.defaultHeight;
                    touched = false;

                    lowerAndCheckForContact(x, y, z, function(ret) {
                        console.log('Calibrated point 2/3 ' + JSON.stringify(ret));
                        robot.resetPosition();
                        if (!ret.status) return;
                        cal.p2.position.x = ret.position[0];
                        cal.p2.position.y = ret.position[1];
                        cal.p2.position.z = ret.position[2];
                        cal.p2.screen.x = ret.screen[0];
                        cal.p2.screen.y = ret.screen[1];

                        setTimeout(
                            function() {
                                x = config.calWidth, y = 0; z = config.defaultHeight;
                                touched = false;

                                lowerAndCheckForContact(x, y, z, function(ret) {
                                    console.log('Calibrated point 3/3 ' + JSON.stringify(ret));
                                    robot.resetPosition();
                                    if (!ret.status) return;
                                    cal.p3.position.x = ret.position[0];
                                    cal.p3.position.y = ret.position[1];
                                    cal.p3.position.z = ret.position[2];
                                    cal.p3.screen.x = ret.screen[0];
                                    cal.p3.screen.y = ret.screen[1];

                                    console.log('Saving calibration data:' + JSON.stringify(cal))
                                    robot.setCalibrationData(cal);
                                    calibratingInProgress = false;

                                    // apdeitojam visus klientus
                                    io.sockets.emit('info', getInfo());

                                    fs.writeFile('calibration.json', JSON.stringify(cal), function(err) {
                                        if (err) {
                                            console.log('Calibration data could not be saved: ' + err);
                                        } else {
                                            console.log('Calibration data saved to "calibration.json"');
                                        }
                                    });
                                });
                            }, 1000);
                    });
                }, 1000);
        });
    }

    function stopCalibration() {
        calibratingInProgress = false;
    }

    io.sockets.on('connection', function(socket) {

        console.log('New connection esablished');

        // nosūta klientam robota pozīciju
        update = {};
        update.angles = robot.getAngles();
        update.position = robot.getPosition();

        socket.emit('update', update);
        socket.emit('info', getInfo());

        socket.on('getInfo', function() {
            console.log('info requested. sending...')
            socket.emit('info', getInfo());
        });

        // When user navigates to /cal if isTouchDevice, sends screen resoluton, user agent.
        socket.on('calibrationDeviceConnected', function(data) {
            console.log('calibrationDeviceConnected' + data);
            socket.broadcast.emit('calibrationDeviceConnected', data);
        });

        socket.on('startCalibration', function() {
            console.log('startCalibration()');
            startCalibration();
        });

        socket.on('stopCalibration', function() {
            console.log('stopCalibration()');
            stopCalibration();
        });

        // Receive touch events from calibration page
        socket.on('calibrationTouch', function(data) {
            touched = true;
            tX = data.tX;
            tY = data.tY;
            console.log('calibrationTouch: ' + tX + ';' + tY);
        });

        // Receive device info
        socket.on('deviceInfo', function(data) {
            var cal = robot.getCalibrationData();
            cal.device = data;
            robot.setCalibrationData(cal);
            console.log('deviceInfo received: '+ JSON.stringify(data));
            // console.log('Saving calibration data:' + JSON.stringify(cal))
        });

        socket.on('moveServos', function(data) {
            robot.setAngles(data[0], data[1], data[2]);
        });

        socket.on('moveLinear', function(data) {
            robot.setPosition(data.x, data.y, data.z);
        });

        socket.on('moveScreen', function(data) {
            var position = robot.getPositionForScreenCoordinates(data.x, data.y);
            console.log('screen[' + [data.x, data.y, data.z] + '] => position[' + [position.x, position.y, data.z] + ']');
            robot.setPosition(position.x, position.y, data.z);
        });

        socket.on('tap', function(data) {
            robot.tap(data.x, data.y, function() {
                // console.log("finished tap");
            });
        });

        socket.on('resetPosition', function(data) {
            robot.resetPosition();
        });
    });

}
