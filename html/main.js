var $ = require('jQuery');
var remote = null;
var path = require('path');
var fs = require('fs');
var cluster = require('cluster');
var os = require('os');
var request = require('request');

//DESCRIBES THE AREAS IN DOM
const CARD_GROUPS = ["downloading", "finished", "failed"];

//DOM TEMPLATES FOR UI
const DIVIDER = "<div class=\"divider\" id=\"r-{{Name}}-divider\"></div>";
const ITEM_TEMPLATE = '<div class="item" id="r-{{Name}}"><div class="header">{{Name}}</div><div class="status">{{Status}}</div></div>';

//MESSAGES TO BE SENT BETWEEN PROCESSES
const READY_MESSAGE = 'READY_SEND_COMMAND';
const SEND_COMMAND = 'COMMAND';
const LOG_COMMAND = 'CONSOLE_LOG';
const UI_ADD_ITEM = 'UI_ADD_ITEM';
const UI_UPDATE_STATUS = 'UI_UPDATE_STATUS';
const UI_MOVE_ITEM = 'UI_MOVE_ITEM';


if(cluster.isMaster) {
  require('remote');
  cluster.setupMaster({
    exec: path.join(__dirname, "main.js"),
    //args: ['--use', 'https'],
    silent: false
  });

  command("emmawatson");
  command("nonexistantsubredditkljhdsfgkh");
}
if(cluster.isWorker) {
  process.on('message', function(msg) {
    Commands.download(msg, 1);
  });
  process.send(READY_MESSAGE);
}

var UI = {
  addItem: function (area, subreddit, status) {
    var items = $("#" + area);
    var placeholder = $("#" + area + "Placeholder");
    if(!placeholder.hasClass("closed")) {
      items.append(DIVIDER);
      placeholder.addClass("closed");
    }
    items.append(ITEM_TEMPLATE.replace(/\{\{Name\}\}/g, subreddit).replace(/\{\{Status\}\}/g, status));
    items.append(DIVIDER.replace(/\{\{Name\}\}/g, subreddit));
  },
  removeItem: function(subreddit) {
    var item = $("#r-" + subreddit);
    var divider = $("#r-" + subreddit + "-divider");
    item.addClass("closing");
    setTimeout(function(){
      item.remove();
      divider.remove();
      CARD_GROUPS.forEach(function(tabName){
        var itemsLeft = $("#" + tabName + ">.item");
        var tab = $("#" + tabName);
        if(itemsLeft.length == 0) {
          tab.empty();
          var placeholder = $("#" + tabName + "Placeholder");
          placeholder.removeClass("closed");
        }
      });
    }, 500);
  },
  changeStatus: function(subreddit, status) {
    $("#r-" + subreddit + ">.status").html(status);
  },
  getStatus: function(subreddit) {
    return $("#r-" + subreddit + ">.status").html();
  },
  moveItem: function(subreddit, area) {
    var currentStatus = UI.getStatus(subreddit);
    UI.removeItem(subreddit);
    UI.addItem(area, subreddit, currentStatus);
  }
};

var Imgur = {
  getPage: function (subreddit, page, callback, failCallback) {
    request({
      url:"https://api.imgur.com/3/gallery/r/" + subreddit + "/" + (page - 1) + ".json",
      headers: {
        "Authorization": "client-id 76535d44f1f94da"
      }
    }, (err, response, body) => {
      if (err){
        failCallback(response, body);
        return;
      }
      callback(JSON.parse(body));
    });


  }
};

//these are basically all happening worker side
var Commands = {
  download: function (subreddit, pages) {
    send(UI_ADD_ITEM, subreddit);

    Imgur.getPage(subreddit, 1, (page) => {
      if (page.data.length == 0) {
        send(UI_MOVE_ITEM, subreddit, "failed");
        send(UI_UPDATE_STATUS, subreddit, "Subreddit does not exist");
        return;
      }
      send(LOG_COMMAND, page);
    }, () => {
      send(UI_MOVE_ITEM, subreddit, "failed");
      send(UI_UPDATE_STATUS, subreddit, "Imgur Responded with an internal error");
    });
  }
};

var Files = {
  baseFolder: "",
  setup: function() {
    //just sanity check that yo
    if(Files.baseFolder == "") {
      Files.baseFolder = path.join(os.homedir(), "Desktop", "imgur");
    }

    var baseFolderExists = false;
    try{
      fs.stat(Files.baseFolder);
    }catch(err) {
      //if we errored, then it probably isnt real...
      fs.mkdir(Files.baseFolder);
    }
  },
  createFolder: function(folder) {

  }
};

function command(str) {
  //i dont think it can happen because only master is hooked into DOM
  //but just in case, right, lets just check.
  if(cluster.isWorker) return;
  var worker = cluster.fork();
  worker.on('message', function(message) {
    console.log(message);

    var parts = message.split("\r\n");

    if(message == READY_MESSAGE) {
      worker.send(str);
      console.log("sent " + str);
    }else if(parts[0] == UI_ADD_ITEM) {
      UI.addItem("downloading", parts[1], "Initializing download...");
    }else if(parts[0] == UI_MOVE_ITEM) {
      UI.moveItem(parts[1], parts[2]);
    }else if(parts[0] == UI_UPDATE_STATUS) {
      UI.changeStatus(parts[1], parts[2]);
    }else if(parts[0] == LOG_COMMAND) {
      console.log(parts[1]);
    }
  });
};

function search(e) {
  if(e.keyCode != 13) return true;
  var commandStr = $("#search>input").val();
  console.log(commandStr);
  command(commandStr);
  $("#search>input").val("");
  return false;
}

//function for sending RPCs back to master
function send(...args) {
  process.send(args.join("\r\n"))
}
