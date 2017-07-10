var fs = require("fs");

// default calibration
module.exports.defaultData = {
  restPoint : {
    x : 0,
    y : 0,
    z : -130
  },
  servo1 : {
    minimumAngle : 20,
    maximumAngle : 90
  },
  servo2 : {
    minimumAngle : 20,
    maximumAngle : 90
  },
  servo3 : {
    minimumAngle : 20,
    maximumAngle : 90
  }
};

module.exports.getDataFromFilePath = function(filePath) {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } else {
    return null;
  }
};
