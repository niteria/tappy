# About
Tappy is a [Tapster](https://github.com/hugs/tapsterbot) based sofware adapted for [TestDevLab](http://testdevlab.com) needs.
Includes improved calibration method using web browser, web based control panel and record and play tool for automating tests.

# Installation
Tested with Node.js v10.11.0

```sh
$ git clone https://github.com/guntiss/tappy.git
$ cd tappy
$ npm install
$ npm start
```

Edit config.js according to your setup (config.pins, defaultPosition height, ..)

## Robot Control panel
To access control panel, navigate to **http://server_ip/control**

**Features available:**
- Servo motor position adjustment
- Linear movements

![Control panel screen](https://preview.ibb.co/kbZKcv/panel.png)

# Calibration
Calibration consists of two parts:
1) Manual servo arm calibration must be done only once after assembling the robot. While rods are detached you can use "Control panel" to adjust all servos for horizontal and vertical arm state, and put those values in config.js accordingly: config.sX = { pin: X, min: 19, max: 101 };
After this calibration, linear movement should work correctly, if not, something is wrong.

2) Device calibration is done by opening http://server_ip/cal on mobile device web browser. This is needed to be able to work with phone screen coordinates. Make sure that phone recognises stylus touches (it must be grounded to arduino GND) and that screen coordinates are being displayed at server console when touching screen.
Then you just press "calibrate" and automatic calibration happens, that writes correct values inside calibration.json. You should NOT edit this file manually.
If during calibration stylus moves outside phone dimensions, decrease config.calWidth value.

![Calibration screen](https://preview.ibb.co/hRAEAF/calibration.png)

# Record And Play
Navigate to  **http://server_ip/record_and_play**
You Should see this screen:
![Record and play tool](https://preview.ibb.co/bPeucv/rnp.png)
To use just click on screen and coordinates will be added to textarea.
Note: realtime screen update is not yet integrated. There is known bug if you stop and restart script.
