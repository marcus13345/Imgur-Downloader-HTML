
var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
//var GUID =
var Appdata = path.join(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preferences' : '/var/local'), "MAndWorks", "SubSavur");
//make sure our folder exists...
fse.ensureDirSync(Appdata);

//GUID SHIT
var GUIDPath = path.join(Appdata, "GUID");
var GUID;
try{
  fs.accessSync(GUIDPath, fs.F_OK);
  GUID = fs.readFileSync(GUIDPath, 'utf8');

}catch(e) {
  GUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
  fs.writeFileSync(GUIDPath, GUID, 'utf8');
}
module.exports = GUID;
