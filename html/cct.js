
var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');
var cluster = require('cluster');
var os = require('os');
var request = require('request');
var GUID = require("./GUID.js");
var version = require("./version.js");
var clustering = require("./customClustering.js");
var send = clustering.send;
var READY_MESSAGE = clustering.READY_MESSAGE;
var CONSOLE_LOG = clustering.CONSOLE_LOG;
var CONSOLE_LOG_JSON = clustering.CONSOLE_LOG_JSON;
var UI_ADD_ITEM = clustering.UI_ADD_ITEM;
var UI_UPDATE_STATUS = clustering.UI_UPDATE_STATUS;
var UI_MOVE_ITEM = clustering.UI_MOVE_ITEM;

send(CONSOLE_LOG, "hey?");


if(cluster.isMaster) {
  cluster.setupMaster({
    exec: path.join(__dirname, "main.js"),
    //args: ['--use', 'https'],
    silent: false
  });

  //command("emmawatson");
  // command("nonexistantsubredditkljhdsfgkh");

}

if(cluster.isWorker) {
  process.on('message', function(msg) {
    Commands.download(msg, 4);
  });

  process.send(READY_MESSAGE);
  //send(CONSOLE_LOG, $.toString());
}

//big fat adapter
// TODO actually write these bits
var Analytics = require("./Analytics.js");


function command(str) {
  //i dont think it can happen because only master is hooked into DOM
  //but just in case, right, lets just check.
  if(cluster.isWorker) return;
  var worker = cluster.fork();
  worker.on('message', function(message) {
    //console.log(message);

    console.log(message);
    var parts = message.split("\r\n");

    if(message == READY_MESSAGE) {
      worker.send(str);
    }else if(parts[0] == UI_ADD_ITEM) {
      UI.addItem("downloading", parts[1], UI.getInitializingString());
    }else if(parts[0] == UI_MOVE_ITEM) {
      UI.moveItem(parts[1], parts[2]);
    }else if(parts[0] == UI_UPDATE_STATUS) {
      UI.changeStatus(parts[1], parts[2]);
    }else if(parts[0] == CONSOLE_LOG) {
      console.log(parts[1]);
    }else if(parts[0] == CONSOLE_LOG_JSON) {
      console.log(JSON.parse(parts[1]));
    }
  });
};
