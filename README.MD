# About
Tappy is a [Tapster](https://github.com/hugs/tapsterbot) based sofware adapted for [TestDevLab](http://testdevlab.com) needs.
Includes improved calibration method using web browser, web based control panel and record and play tool for automating tests.

# Installation
Tested with Node.js v7.8.0

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
Connect your phone to same WiFi network as server (make sure there is no AP isolation, otherwise you won't be able to reach it). Navigate to  **http://server_ip/cal**
Should see this screen:
![Calibration screen](https://preview.ibb.co/hRAEAF/calibration.png)
Verify that screen coordinates ar being displayed at server console when touching screen.
Press "calibrate" to begin automatic calibration process.
Make sure there is ground wire from arduino attached to stylus pen, otherwise phone might not register touch event.

# Record And Play
Navigate to  **http://server_ip/record_and_play**
You Should see this screen:
![Record and play tool](https://preview.ibb.co/bPeucv/rnp.png)
To use just click on screen and coordinates will be added to textarea.
Note: realtime screen update is not yet integrated. There is known bug if you stop and restart script.

License
----

Simplified BSD License
