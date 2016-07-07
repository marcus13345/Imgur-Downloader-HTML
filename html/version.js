var fs = require("fs");
var path = require("path");

var version;

try {
  fs.accessSync(path.join("version"), fs.F_OK);
  version = fs.readFileSync("Version", 'utf8').toString().trim();
}catch(e) {
  console.error(e.toString());
  version = "Broken";
}

module.exports = version;
