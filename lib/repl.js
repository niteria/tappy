exports = module.exports = function(board, robot) {

    /* go to screen coordinates */
    tap = function(x, y) {
        // var screen = robot.getPositionForScreenCoordinates(x, y);
        // robot.setPosition(screen.x, screen.y, robot.getContactZ());
        robot.tap(x, y, function() {
            // console.log("finished tap");
        });
    }

    swipe = function(sx, sy, ex, ey) {
        // var screen = robot.getPositionForScreenCoordinates(x, y);
        // robot.setPosition(screen.x, screen.y, robot.getContactZ());
        robot.swipe(sx, sy, ex, ey, function() {
            console.log("finished swipe");
        });
    }

    type = function(text) {
        robot.sendKeys(text, function() {
            console.log('done typing: ' + text);
            robot.resetPosition();
        });
    }

    var moveTimer = 0;
    move = function(x, y, z, when) {
        moveTimer += when;
        setTimeout(function() { robot.go(x, y, z) }, moveTimer);
    }

    mx = function(x, y, when, touch) {
        // when = 1200;
        moveTimer += when;
        pos = robot.getPositionForScreenCoordinates(x, y);
        var _x = pos.x;
        var _y = pos.y;
        var _z = (touch) ? robot.getContactZ() * 1 : robot.getContactZ() * 0.96;
        _moveTimer = moveTimer;
        console.log("dis:" + moveTimer);
        setTimeout(function(_x, _y, _z, _moveTimer) {
            console.log("go:" + [_x, _y, _z] + "at: " + _moveTimer);
            robot.go(_x, _y, _z, 200)
        }, moveTimer, _x, _y, _z, _moveTimer);
    }

    function t(x, y) {
        moveTimer += 800;
        setTimeout(function(x, y) {
            robot.tap(x, y, function() {})
        }, moveTimer, x, y);

    }

    home = function(text) {
        setTimeout(function() { robot.go(-7, -66, -186) }, 0);
        setTimeout(function() { robot.go(-7, -66, -199) }, 500);
        setTimeout(function() { robot.go(-7, -66, -186) }, 1000);
        // setTimeout(function() { robot.go() }, 1500);
    }


    testRunner = function(test) {
        console.log("Running test #" + test)
        if (test == 1) {
            setTimeout(function() { robot.go(30, 39, -155) }, 0);
            setTimeout(function() { robot.go(-27, 39, -155) }, 1000);
            setTimeout(function() { robot.go(30, -68, -155) }, 2000);
            setTimeout(function() { robot.go(-30, -67, -155) }, 3000);
            setTimeout(function() { robot.go(30, 39, -155) }, 4000);
            setTimeout(function() { robot.go() }, 5000);
        } else if (test == 2) {
            setTimeout(function() { robot.go(30, 39, -145) }, 0);
            setTimeout(function() { robot.go(-27, 39, -145) }, 1000);
            setTimeout(function() { robot.go(-30, -67, -145) }, 2000);
            setTimeout(function() { robot.go(30, -68, -145) }, 3000);
            setTimeout(function() { robot.go(30, 39, -145) }, 4000);
            setTimeout(function() { robot.go() }, 5000);
        } else if (test == 3) {

            home();
            moveTimer = 1000;

            move(12, -24, -140, 500); //go to swipe start
            move(12, -24, -150, 500); //push down
            move(-20, -24, -150, 500); // do swipe
            move(-20, -24, -140, 500); // get up

            move(9, -24, -140, 1000); // push
            move(9, -24, -150, 1000); // push
            move(9, -24, -140, 300); // push
            moveTimer = 0;

        } else if (test == 4) {

            // home();
            moveTimer = 0;

            mx(20, 35, 1000, 0);
            mx(20, 35, 1000, 1);
            mx(1030, 35, 1000, 1);
            mx(1035, 1940, 1000, 1);
            mx(35, 1940, 1000, 1);
            mx(35, 35, 1000, 1);
            // mx(35, 35, 1000, 0);
            // mx(50, 25, 1000, 1);

            mx(1090, 1800, 1000, 1);

            mx(1080, 0, 1000, 1);
            mx(0, 1940, 1000, 1);
            mx(0, 1940, 1000, 0);

            setTimeout(function() { robot.resetPosition(); }, moveTimer);

        } else if (test == 5) {

            moveTimer = 0;

            for (i = 0; i < 100; i++) {
                moveTimer += 1000;
                _x = 500;
                _y = 500;
                setTimeout(function(_x, _y) {
                    robot.tap(_x, _y, function() {})
                }, moveTimer, _x, _y);
            }
        } else if (test == 6) {
            moveTimer = 0;
            t(482, 1409);
            t(719, 1547);
            t(806, 1395);
            t(300, 1593);
            t(574, 1853);
            t(276, 1553);
            t(703, 1553);
            t(822, 1422);
            t(519, 1459);
            t(572, 1820);
            t(508, 1573);
            t(802, 1413);
            t(782, 1707);
            t(180, 1577);
            t(1012, 1518);
            t(1014, 1518);
            t(609, 1411);
            t(609, 1820);
            t(182, 1409);
            t(905, 1406);
            t(386, 1406);
            t(905, 1549);
            t(287, 1549);
            t(1023, 1829);

            moveTimer += 1000;
            setTimeout(function() { testRunner(6); }, moveTimer);

        }
    }
    board.repl.inject({
        tap: tap,
        swipe: swipe,
        type: type,
        t: testRunner,
        home: home,
    });

}