#! /usr/local/bin/node

// Load all Libraries and Config
var
    five = require("johnny-five"),
    calibration = require("./lib/calibration"),
    Robot = require("./lib/robot").Robot,
    kinematics = require("./lib/kinematics"),
    motion = require("./lib/motion"),
    config = require("./config");

const Hapi = require('hapi');

// Initialize HTTP Server
const server = Hapi.server({
	    port: config.port,
});

const init = async () => {
    await server.register(require('inert'));

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


	    await server.start();
	    console.log(`Server running at: ${server.info.uri}`);
};
init();

// Initialize Socket.IO and make globally available
global.io = require('socket.io')(server.listener);

// Initiliaze Johhny-Five Board
var board = new five.Board({ debug: true, port: config.serialport || null });
board.on("ready", function() {

    // Initialize servos
    var s1 = five.Servo({ pin: config.s1.pin });
    var s2 = five.Servo({ pin: config.s2.pin });
    var s3 = five.Servo({ pin: config.s3.pin });

    // Load calibration data
    var calibrationData = calibration.getDataFromFilePath('calibration.json');

    // Initialize kinematics
    var k = new kinematics.Kinematics({
        e: config.e,
        f: config.f,
        re: config.re,
        rf: config.rf
    });

    var robot = new Robot(s1, s2, s3, calibrationData, k, config); // Initialize Robot instance
    // var repl = require('./lib/repl')(board, robot); // Testing through command line
    var rest = require('./lib/rest')(server, robot); // load REST API
    var listeners = require('./lib/listeners')(io, robot, config, s1, s2, s3); // Lets Start socket Listeners
    // server.start(); // And Finally Start HTTP server

        global.ip = "127.0.0.1";
        console.log('Board ready');

});
