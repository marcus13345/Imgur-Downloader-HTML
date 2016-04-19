var $ = require('jQuery');
var remote = null;
var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');
var cluster = require('cluster');
var os = require('os');
var request = require('request');

function testIO() {
  var filepath = path.join(__dirname, "image.jpg");
  var filepath2 = path.join(__dirname, "test.txt");
  var filepath3 = path.join(__dirname, "reddit.json");
  send(CONSOLE_LOG, filepath);
  request({url:"http://i.imgur.com/InnEHyN.jpg"}).pipe(fs.createWriteStream(filepath));
  send(CONSOLE_LOG, filepath2);
  fs.writeFileSync(filepath2, "Sample Text");
  request({url:"http://reddit.com/r/emmawatson.json"}, (err, response, body) => {});
}

//DESCRIBES THE AREAS IN DOM
const CARD_GROUPS = ["downloading", "finished", "failed"];

//DOM TEMPLATES FOR UI
const DIVIDER = "<div class=\"divider\" id=\"r-{{Name}}-divider\"></div>";
const ITEM_TEMPLATE = '<div class="item" id="r-{{Name}}"><div class="header">{{Name}}</div><div class="status">{{Status}}</div></div>';

//MESSAGES TO BE SENT BETWEEN PROCESSES
const READY_MESSAGE = 'READY_SEND_COMMAND';
const CONSOLE_LOG = 'CONSOLE_LOG';
const CONSOLE_LOG_JSON = 'CONSOLE_LOG_JSON';
const UI_ADD_ITEM = 'UI_ADD_ITEM';
const UI_UPDATE_STATUS = 'UI_UPDATE_STATUS';
const UI_MOVE_ITEM = 'UI_MOVE_ITEM';

if(cluster.isMaster) {
  remote = require('remote');
  cluster.setupMaster({
    exec: path.join(__dirname, "main.js"),
    //args: ['--use', 'https'],
    silent: false
  });

  command("emmawatson");
  //command("nonexistantsubredditkljhdsfgkh");

}
if(cluster.isWorker) {
  process.on('message', function(msg) {
    Commands.download(msg, 4);
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

      send(CONSOLE_LOG, err);
      send(CONSOLE_LOG_JSON, JSON.stringify(response));
      send(CONSOLE_LOG_JSON, body);
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
  download: function (subreddit, pageCount) {

    Files.setup();
    Imgur.getPage(subreddit, 1, (page) => {
      //send(CONSOLE_LOG_JSON, JSON.stringify(page));
      send(CONSOLE_LOG, "WE DID THE THING");

      for(var i = 0; i < page.data.length; i ++) {
        var post = page.data[i];
        var filepath = Files.createPath(post);
        request({
          url: post.link
        }).pipe(fs.createWriteStream(filepath));
      }

    }, ()=> {

    });

  },
  downloadPages: function(subreddit, pages, imageCount) {

    send(CONSOLE_LOG, "hey uh, you there mate?");
    testIO();
    //send(UI_MOVE_ITEM, subreddit, "finished");
    Files.setup();



    var completedImages = 0;
    for (var i = 0; i < pages.length; i++) {
      var page = pages[i];
      for (var j = 0; j < page.data.length; j++) {
        var post = page.data[j];
        var filepath = Files.createPath(post);
        //send(CONSOLE_LOG_JSON, JSON.stringify({url: post.link}));
        //send(CONSOLE_LOG, filepath);
        //request({url: post.link}).pipe(fse.createWriteStream(filepath));
        // .on('close', () => {
        //   completedImages += 1;
        //   send(UI_UPDATE_STATUS, subreddit, "downloading " + completedImages + " of " + imageCount);
        // });
      }
    }
  }
};

var Files = {
  baseFolder: "",
  setup: function() {
    //just sanity check that yo
    if(Files.baseFolder == "") {
      Files.baseFolder = path.join(os.homedir(), "Desktop", "imgur");
    }
    fse.ensureDirSync(Files.baseFolder)
  },
  createPath: function(post) {
    fse.ensureDirSync(path.join(Files.baseFolder, post.section));
    return path.join(Files.baseFolder, post.section, post.id) + "." + Files.getExtension(post.type);
  },
  getExtension: function(mimetype) {
    if(mimetype == "image/png") return "png";
    if(mimetype == "image/jpeg") return "jpg";
    if(mimetype == "image/gif") return "gif";
    return "jpg";
  }
};

function command(str) {
  //i dont think it can happen because only master is hooked into DOM
  //but just in case, right, lets just check.
  if(cluster.isWorker) return;
  var worker = cluster.fork();
  worker.on('message', function(message) {
    //console.log(message);

    var parts = message.split("\r\n");

    if(message == READY_MESSAGE) {
      worker.send(str);
    }else if(parts[0] == UI_ADD_ITEM) {
      UI.addItem("downloading", parts[1], "Initializing download...");
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
