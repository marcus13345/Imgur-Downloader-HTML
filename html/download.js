var fs = require('fs');
var path = require('path');
var request = require('request');
var cluster = require('cluster');
var $ = require('jquery');
console.log("im here...");

/*
if(cluster.isMaster) {
  cluster.setupMaster({
    exec: path.join(__dirname, "download.js"),
    //args: ['--use', 'https'],
    silent: false
  });
  var worker = cluster.fork();
  worker.on('message', function(msg) {
    console.log(msg);
  });
}else {
  process.on('message', function(msg) {
    console.log('Master -> Worker: ', msg);
  });
  process.send("ASDFasdfaSDFASdfASDFasdfASDF");
  try{
    var filepath = path.join(__dirname, "image.jpg");
    var filepath2 = path.join(__dirname, "test.txt");
    process.send("" + filepath);
    request({url:"http://i.imgur.com/InnEHyN.jpg"}).pipe(fs.createWriteStream(filepath));
    process.send("" + filepath2);
    fs.writeFileSync(filepath2, "Sample Text");
    process.send("ASDFasdfaSDFASdfASDFasdfASDF");
  }catch(err) {
    process.send(err);
    process.send("I FUCKED UP");
  }
  process.send("ASDFasdfaSDFASdfASDFasdfASDF");
}
*/

console.log($.ajax);
