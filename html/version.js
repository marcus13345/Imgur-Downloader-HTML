var fs = require("fs");
var path = require("path");

var version;

try {
  var filepath = version = path.join(path.resolve(__dirname, ".."), "ssversion");
  fs.accessSync(filepath, fs.F_OK);
  version = fs.readFileSync(filepath, 'utf8').toString().trim();
}catch(e) {
  console.error(e.toString());
  version = "Broken";
}



module.exports = version;
