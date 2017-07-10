var config = {}

// config.port = 80; // override HTTP port
// config.serialport = 'COM3' // override serial port

//Side of end effector
config.e_ = 'Math.sqrt(3) * 10 * 2';
config.e = 34.64101615137754;

//Side of top triangle

config.f_ = 'Math.sqrt(3) * 32 * 2';
config.f = 110.85125168440814;

//Length of parallelogram joint
config.re_ = '145 + 8.5';
config.re = 155;

//Length of upper joint
config.rf_ = 'Math.sqrt(52**2 + 8.5**2)';
config.rf = 52.690131903421914;

// Specify Servo PIN numbers
config.pins = [2, 3, 4];

config.defaultEaseType = "linear";
config.defaultPosition = [0, 0, -163]; // sis iet uz devaisa konfig

//Delay for commands in SVGReader
//Note that some commands will take longer than this
//Default value is 150
config.delay = 200;


module.exports = config;
