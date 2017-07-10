var http = require('http');

exports.client = function(address, port) {
  var get = function(path, cb) {
    return http.get({ host: address, port: port, path: path }, function(res){
      res.setEncoding('utf8');
      return res.on('data', function(chunk) {
        var result = JSON.parse(chunk);
        return cb(result.data);
      });
    }).on("error", function(err){
      console.log("Got error: " + err.message);
      return cb(null, err);
    });
  };
  var post = function(path, bodyData, cb) {
    var req = http.request({ host: address, port: port, path: path, method: 'POST'}, function(res) {
      res.setEncoding('utf8');
      return res.on('data', function (chunk) {
        var result = JSON.parse(chunk);
        return cb(result.data);
      });
    }).on('error', function(err) {
      console.log("Got error: " + err.message);
      return cb(null, err);
    });
    req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.write(bodyData);
    req.write('\n');
    req.end();
  };
  return {
    address : address,
    port : port,
    url : function(uri) {
      return 'http://' + address + ":" + port + uri;
    },
    angles : function(cb) {
      return get('/angles', cb);
    },
    setAngles : function(theta1, theta2, theta3, cb) {
      var postData = "theta1=" + theta1 + "&theta2=" +theta2 + "&theta3=" + theta3;
      return post('/setAngles', postData, cb);
    },
    position : function(cb) {
      return get('/position', cb);
    },
    setPosition : function(x, y, z, cb) {
      var postData = "x=" + x + "&y=" + y + "&z=" + z;
      return post('/setPosition', postData, cb);
    },
    tap : function(x, y, cb) {
      var postData = "x=" + x + "&y=" + y;
      return post('/tap', postData, cb);
    },
    reset : function(cb) {
      return post('/reset', '', cb);
    },
    calibrationData : function(cb) {
      return get('/calibrationData', cb);
    },
    setCalibrationData : function(newData, cb) {
      var postData = "newData=" + JSON.stringify(newData);
      return post('/setCalibrationData', postData, cb);
    }
  };
};