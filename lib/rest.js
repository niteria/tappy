drawing = require("./draw");
arc = require("./arc");

exports = module.exports = function(server, robot) {

  var getCommonReponseObject = function(err, data) {
    if (err) {
      return { status: err.code, data: err };
    } else {
      return { status: 0, data: data };
    }
  };

  server.route({
    method: 'GET',
    path: '/status',
    handler: function(request, reply) {
      console.log("GET " + request.path + ": ");
      reply(getCommonReponseObject(null, '"OK"'));
    }
  });

  server.route({
    method: 'POST',
    path: '/reset',
    handler: function(request, reply) {
      console.log("POST " + request.path + ": ");
      robot.resetPosition();
      reply(getCommonReponseObject(null, robot.getAngles()));
    }
  });

  server.route({
    method: 'POST',
    path: '/dance',
    handler: function(request, reply) {
      console.log("POST " + request.path + ": ");
      robot.startDancing();
      reply(getCommonReponseObject(null, '"Dancing!"'));
    }
  });

  server.route({
    method: 'POST',
    path: '/stopDancing',
    handler: function(request, reply) {
      console.log("POST " + request.path + ": ");
      robot.stopDancing();
      reply(getCommonReponseObject(null, '"No more dancing."'));
    }
  });

  server.route({
    method: 'POST',
    path: '/setAngles',
    handler: function(request, reply) {
      console.log("POST " + request.path + ": ");
      var theta1 = parseFloat(request.payload.theta1);
      var theta2 = parseFloat(request.payload.theta2);
      var theta3 = parseFloat(request.payload.theta3);
      robot.setAngles(theta1, theta2, theta3);
      return reply(getCommonReponseObject(null, robot.getAngles()));
    }
  });

  server.route({
    method: 'POST',
    path: '/setPosition',
    handler: function(request, reply) {
      console.log("POST " + request.path + ": ");
      var x = parseFloat(request.payload.x);
      var y = parseFloat(request.payload.y);
      var z = parseFloat(request.payload.z);
      robot.setPosition(x, y, z);
      return reply(getCommonReponseObject(null, '"OK"'));
    }
  });

  server.route({
    method: 'GET',
    path: '/angles',
    handler: function(request, reply) {
      console.log("GET " + request.path + ": ");
      return reply(getCommonReponseObject(null, robot.getAngles()));
    }
  });

  server.route({
    method: 'GET',
    path: '/position',
    handler: function(request, reply) {
      console.log("POST " + request.path + ": ");
      return reply(getCommonReponseObject(null, robot.getPosition()));
    }
  });

  server.route({
    method: 'GET',
    path: '/anglesForPosition/x/{x}/y/{y}/z/{z}',
    handler: function(request, reply) {
      console.log("GET " + request.path + ": ");
      var x = parseFloat(request.params.x);
      var y = parseFloat(request.params.y);
      var z = parseFloat(request.params.z);
      return reply(getCommonReponseObject(null, robot.getAnglesForPosition(x, y, z)));
    }
  });

  server.route({
    method: 'GET',
    path: '/positionForScreenCoordinates/x/{x}/y/{y}',
    handler: function(request, reply) {
      console.log("GET " + request.path + ": ");
      var x = parseFloat(request.params.x);
      var y = parseFloat(request.params.y);
      return reply(getCommonReponseObject(null, robot.getPositionForScreenCoordinates(x, y)));
    }
  });

  server.route({
    method: 'POST',
    path: '/tap',
    handler: function(request, reply) {
      var x = parseFloat(request.payload.x);
      var y = parseFloat(request.payload.y);
      console.log("POST " + request.path + " " + JSON.stringify(request.payload));
      return robot.tap(x, y, function() {
        return reply(getCommonReponseObject(null, '"OK"'));
      });
    }
  });

  server.route({
    method: 'POST',
    path: '/go',
    handler: function(request, reply) {
      var x = parseFloat(request.payload.x);
      var y = parseFloat(request.payload.y);
      var z = parseFloat(request.payload.z);
      var easeType = request.payload.easing;
      console.log("POST " + request.path + " " + JSON.stringify(request.payload));
      robot.go(x, y, z, easeType);
      return reply(getCommonReponseObject(null, '"OK"'));
    }
  });

  server.route({
    method: 'POST',
    path: '/swipe',
    handler: function(request, reply) {
      var startX = parseFloat(request.payload.startX);
      var startY = parseFloat(request.payload.startY);
      var endX = parseFloat(request.payload.endX);
      var endY = parseFloat(request.payload.endY);
      console.log("POST " + request.path + " " + JSON.stringify(request.payload));
      return robot.swipe(startX, startY, endX, endY, function() {
        return reply(getCommonReponseObject(null, '"OK"'));
      });
    }
  });

  server.route({
    method: 'POST',
    path: '/sendKeys',
    handler: function(request, reply) {
      console.log("POST " + request.path + ": ");
      var keys = decodeURIComponent(request.payload.keys);
      return robot.sendKeys(keys, function() {
        return reply(getCommonReponseObject(null, '"OK"'));
      });
    }
  });

  server.route({
    method: 'GET',
    path: '/calibrationData',
    handler: function(request, reply) {
      console.log("GET " + request.path + ": ");
      return reply(getCommonReponseObject(null, robot.getCalibrationData()));
    }
  });

  server.route({
    method: 'POST',
    path: '/setCalibrationData',
    handler: function(request, reply) {
      console.log("POST " + request.path + ": ");
      var newData = JSON.parse(request.payload.newData);
      robot.setCalibrationData(newData);
      return reply(getCommonReponseObject(null, robot.getCalibrationData()));
    }
  });

  server.route({
    method: 'POST',
    path: '/circle',
    handler: function(request, reply) {

      var centerX = parseFloat(request.payload.x);
      var centerY = parseFloat(request.payload.y);
      var centerZ = parseFloat(request.payload.z);
      var radius = parseFloat(request.payload.radius);
      var startAngle = parseFloat(request.payload.startAngle);
      var anticlockwise = parseFloat(request.payload.anticlockwise) ? false : true;
      var delay = parseFloat(request.payload.delay);
      var rotations = parseFloat(request.payload.rotations);

      // An array to save points on the arc
      var points = arc(centerX, centerY, centerZ, radius, startAngle, startAngle, anticlockwise);
      // console.log('payload: '+[centerX, centerY, centerZ, radius, startAngle, anticlockwise, delay, rotations]);
      // console.log('arc points: '+JSON.stringify(points));

      // Go to each point in the arc
      for (var rotation = 0; rotation < rotations; rotation += 1) {
        for (var i = 0; i < points.length; i += 1) {
          setTimeout( function(point, i) {
            console.log('circle: '+(i+1)+'/'+ points.length+' @ '+[point.x, point.y, point.z])
            robot.go(point.x, point.y, point.z, "none")
          },
          i*delay + points.length*delay*rotation,
          points[i], i);
        }
      }
      console.log("POST " + request.path + " " + JSON.stringify(request.payload));

      // Return
      setTimeout(function(){ reply(getCommonReponseObject(null, '"OK"')) }, points.length*delay*rotations );
    }
  });


}
