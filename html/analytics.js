var GUID = require("./GUID.js");
var version = require("./version.js");
var request = require('request');
var path = require('path');
var clustering = require("./customClustering.js");

var send = clustering.send;
var READY_MESSAGE = clustering.READY_MESSAGE;
var CONSOLE_LOG = clustering.CONSOLE_LOG;
var CONSOLE_LOG_JSON = clustering.CONSOLE_LOG_JSON;
var UI_ADD_ITEM = clustering.UI_ADD_ITEM;
var UI_UPDATE_STATUS = clustering.UI_UPDATE_STATUS;
var UI_MOVE_ITEM = clustering.UI_MOVE_ITEM;


send(CONSOLE_LOG, "Analytics functions imported...");
module.exports = {
  LogDownload: function(subreddit, count) {
    try{
      request.post(
        "http://api.mandworks.com/subsavur/LogDownload.php",
        {
          "form": {
            "DownloadType": "subreddit",
            "DownloadAmount": count,
            "Download": subreddit,
            "GUID": GUID,
            "SubSavurVersion": version
          }
        },
        function(a, b, c) {}
      );
    }catch(e) {
      send(CONSOLE_LOG, e.toString());
    }
  },
  LogEvent: function(event, cb) {
    try{
      request.post(
        "http://api.mandworks.com/subsavur/LogEvent.php",
        {
          "form": {
            "Event": event,
            "GUID": GUID,
            "SubSavurVersion": version
          }
        },
        function(a, b, c) {
          if(typeof cb != "undefined") cb();
        }
      );
    }catch(e) {
      send(CONSOLE_LOG, e);
      send(CONSOLE_LOG_JSON, e);
    }
  },
  EVENTS: {
    SESSION_STARTED: "SESSION_STARTED",
    SESSION_ENDED: "SESSION_ENDED",
    UPDATE_ACEPTED: "UPDATE_ACCEPTED",
    UPDATE_REJECTED: "UPDATE_REJECTED"
  }
}
