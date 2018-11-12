var fs = require("fs");

module.exports.getDataFromFilePath = function(filePath) {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
  return null;
};
