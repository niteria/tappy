var prompt = require("prompt"),
    fs = require("fs"),
    eol = require('os').EOL,
    ArgumentParser = require('argparse').ArgumentParser,
    robot = require('./robot_http_client').client("127.0.0.1", "4242"),
    wd = require('wd');

var args = {},
    newCalibrationData = {};

function CalibrationManager(argv) {
    args = argv;
    prompt.message = '';
    prompt.delimiter = '';
    prompt.start();
}
exports.CalibrationManager = CalibrationManager;

var getCommandLineArgs = function() {
    var parser = new ArgumentParser({
        version: '0.0.1',
        addHelp: true,
        description: 'Tapster Calibration Script'
    });

    parser.addArgument(
        ['-o', '--output'], {
            defaultValue: "calibration.json",
            help: 'file to save calibration data to'
        }
    );

    return parser.parseArgs();
};

CalibrationManager.prototype.calibrate = function() {
    robot.calibrationData(function(calibrationData) {
        console.log("Receiving existing calibration data.");
        newCalibrationData = calibrationData;
        console.log(JSON.stringify(newCalibrationData));
        return askToCalibrateRobot(function() {
            return askToCalibrateDevice(function() {
                saveCalibrationData(function() {
                    console.log("Calibration Complete");
                });
            })
        });
    });
};

var askToCalibrateRobot = function(cb) {
    var schema = {
        name: "answer",
        description: 'Would you like to calibrate the robot arms?',
        type: 'string'
    };
    prompt.get(schema, function(err, result) {
        if (result.answer.toLowerCase().substr(0, 1) == "y") {
            return calibrateRobot(cb);
        } else {
            return cb();
        }
    });
};

var askToCalibrateDevice = function(cb) {
    var schema = {
        name: "answer",
        description: 'Would you like to calibrate the a device?',
        type: 'string'
    };
    prompt.get(schema, function(err, result) {
        if (result.answer.toLowerCase().substr(0, 1) == "y") {
            return calibrateDevice(cb);
        } else {
            return cb();
        }
    });
};

var saveCalibrationData = function(cb) {

    console.log("New Calibration Data Generated.");
    console.log(JSON.stringify(newCalibrationData));
    return robot.setCalibrationData(newCalibrationData, function() {
        console.log("Robot is now calibrated!");
        return fs.writeFile(args.output, JSON.stringify(newCalibrationData), function(err) {
            if (err) {
                console.log('Calibration data could not be saved: ' + err);
            } else {
                console.log('Calibration data saved to "' + args.output + '"');
            }
            return cb();
        });
    });


};

var calibrateRobot = function(cb) {
    var schema = {
        description: 'Please remove the arms from the robot and press any key to continue...',
        type: 'string'
    };
    return prompt.get(schema, function() {
        var calibrateServos = function(cb) {

            var calibrateServo = function(armIndex, isMin, cb) {
                robot.angles(function(angles) {
                    var description = 'Enter an adjustment for arm #' + (armIndex + 1) + ', enter 0 when the arm is ' +
                        (isMin ? 'parallel to the roof.' : 'perpendicular to the roof');
                    var schema = {
                        name: "delta",
                        description: description,
                        type: 'number'
                    };

                    return prompt.get(schema, function(err, result) {
                        if (result.delta < 0.05 && result.delta > -0.05) {
                            newCalibrationData["servo" + (armIndex + 1)][(isMin ? "min" : "max") + "imumAngle"] = angles[armIndex];
                            return cb();
                        } else {
                            console.log("Old Angles: " + angles);
                            angles[armIndex] = angles[armIndex] + result.delta;
                            console.log("New Angles: " + angles);
                            robot.setAngles(angles[0], angles[1], angles[2], function() {
                                return calibrateServo(armIndex, isMin, cb);
                            });
                        }
                    });
                });
            };

            var calibrateServoMinAndMax = function(armIndex, cb) {
                return robot.reset(function() {
                    return calibrateServo(armIndex, true, function() {
                        return calibrateServo(armIndex, false, cb);
                    });
                });
            };

            // calibrate the servos
            return calibrateServoMinAndMax(0, function() {
                return calibrateServoMinAndMax(1, function() {
                    return calibrateServoMinAndMax(2, function() {
                        return robot.reset(cb);
                    });
                });
            });
        };

        return calibrateServos(function() {
            return cb();
        });
    });
};

var calibrateDevice = function(cb) {
    newCalibrationData.device = {
        contactPoint: { position: {}, screenCoordinates: {} },
        point1: { position: {}, screenCoordinates: {} },
        point2: { position: {}, screenCoordinates: {} }
    };
    var driver = wd.remote({ port: 4723 });
    // optional extra logging
    /*
    driver.on('status', function(info) {
      console.log(info.cyan);
    });
    driver.on('command', function(eventType, command, response) {
      console.log(' > ' + eventType.cyan, command, (response || '').grey);
    });
    */
    driver.on('http', function(meth, path, data) {
        console.log(' > ' + meth.magenta, path, (data || '').grey);
    });

    var lowerAndCheckForContact = function(x, y, currentZ, cb) {
        return robot.setPosition(x, y, currentZ, function() {
            setTimeout(function() {

                var coordRegex = /label[^\(,]+\((\d+\.*\d*),\s+(\d+\.*\d*)\)/;
                return driver.source(function(err, pageSource) {
                    if (coordRegex.test(pageSource)) {
                        var match = coordRegex.exec(pageSource);
                        var screenX = parseFloat(match[1]);
                        var screenY = parseFloat(match[2]);
                        console.log("Found Point: (" + x + "," + y + ") => (" + screenX + "," + screenY + ")");
                        return cb(x, y, screenX, screenY, currentZ);
                    } else {
                        if (currentZ < -150) {
                            return robot.reset(function() {
                                return cb(Error("Could not touch the screen."));
                            });
                        } else {
                            return lowerAndCheckForContact(x, y, currentZ - 2, cb);
                        }
                    }
                });
                //*/

                /*
                return driver.elementByClassName("UIAStaticText", function (err, element) {
                  if (element) {
                    return robot.reset(function() {
                      return element.getLocation(function (err, location) {
                        if (err) {
                          return cb(Error("Could get the element's location."));
                        } else {
                          return element.getSize(function (err, size) {
                            if (err) {
                              return cb(Error("Could get the element's size."));
                            } else {
                              var screenX = location.x + (size.width / 2.0);
                              var screenY = location.y + (size.height / 2.0);
                              return cb(screenX, screenY, currentZ);
                            }
                          });
                        }
                      });
                    });
                  } else {
                    if (currentZ < -150) {
                      return robot.reset(function() {
                        return cb(Error("Could not touch the screen."));
                      });
                    } else {
                      return lowerAndCheckForContact(x, y, currentZ - 2, cb);
                    }
                  }
                });
                //*/

            }, 2000);
        });
    };

    return driver.init({
        app: "Appium.RobotCalibration",
        platform: "iOS",
        platformVersion: "8.2",
        udid: "481309bbf8a3c341687e617bb7104be41f3abb07"
    }, function() {
        driver.setImplicitWaitTimeout(1000, function() {
            return lowerAndCheckForContact(0, 0, -145, function(x, y, screenX, screenY, robotZ) {
                newCalibrationData.device.contactPoint.position = { x: x, y: y, z: robotZ };
                newCalibrationData.device.contactPoint.screenCoordinates = { x: screenX, y: screenY };
                return lowerAndCheckForContact(0, 20, -145, function(x, y, screenX, screenY, robotZ) {
                    newCalibrationData.device.point1.position = { x: x, y: y, z: robotZ };
                    newCalibrationData.device.point1.screenCoordinates = { x: screenX, y: screenY };
                    return lowerAndCheckForContact(20, 0, -145, function(x, y, screenX, screenY, robotZ) {
                        newCalibrationData.device.point2.position = { x: x, y: y, z: robotZ };
                        newCalibrationData.device.point2.screenCoordinates = { x: screenX, y: screenY };
                        return robot.reset(cb);
                    });
                });
            });
        });
    });
};

if (require.main === module) {
    new CalibrationManager(getCommandLineArgs()).calibrate();
}