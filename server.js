#! /usr/local/bin/node

// Load all Libraries and Config
var
    Hapi = require("hapi"),
    five = require("johnny-five"),
    calibration = require("./lib/calibration"),
    Robot = require("./lib/robot").Robot,
    kinematics = require("./lib/kinematics"),
    motion = require("./lib/motion"),
    config = require("./config");

// Initialize HTTP Server
var server = new Hapi.Server();
server.connection({
    host: '0.0.0.0',
    port: config.port || 80
});

server.register(require('inert'), () => {
    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: 'web',
                index: true,
                listing: true,
                defaultExtension: 'html'
            }
        },
        config: {
            cache: {
                expiresIn: 1 // prevent HTML caching
            }
        }
    });
});

// Initialize Socket.IO and make globally available
global.io = require('socket.io')(server.listener);

// Initiliaze Johhny-Five Board
var board = new five.Board({ debug: true, port: config.serialport || null });
board.on("ready", function() {

    // Initialize servos
    var s1 = five.Servo({ pin: config.pins[0] });
    var s2 = five.Servo({ pin: config.pins[1] });
    var s3 = five.Servo({ pin: config.pins[2] });

    // Load calibration data
    var calibrationData = calibration.getDataFromFilePath('calibration.json');

    // Initialize kinematics
    var k = new kinematics.Kinematics({
        e: config.e,
        f: config.f,
        re: config.re,
        rf: config.rf
    });

    var robot = new Robot(s1, s2, s3, calibrationData, k); // Initialize Robot instance
    var repl = require('./lib/repl')(board, robot); // Command Line support
    var rest = require('./lib/rest')(server, robot); // load REST API
    var listeners = require('./lib/listeners')(io, robot, config, s1, s2, s3); // Lets Start socket Listeners
    server.start(); // And Finally Start HTTP server

    require('dns').lookup(require('os').hostname(), function(err, ip, fam) {
        global.ip = ip;
        console.log('Server running at: http://' + ip);
    });

});
