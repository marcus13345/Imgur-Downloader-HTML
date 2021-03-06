var $ = require('jQuery');
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

//because shit was fucking up.
function testIO() {
  var filepath = path.join(__dirname, "image.jpg");
  var filepath2 = path.join(__dirname, "test.txt");
  var filepath3 = path.join(__dirname, "reddit.json");
  send(CONSOLE_LOG, filepath); //yes the picture is glorious emma watson, have fun
  request({url:"http://i.imgur.com/InnEHyN.jpg"}).pipe(fs.createWriteStream(filepath));
  send(CONSOLE_LOG, filepath2);
  fs.writeFileSync(filepath2, "Sample Text");
  request({url:"http://reddit.com/r/emmawatson.json"}, (err, response, body) => {});
}


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

var UI = {

  //DESCRIBES THE AREAS IN DOM
  CARD_GROUPS: ["downloading", "finished", "failed"],

  //DOM TEMPLATES FOR UI
  DIVIDER: "<div class=\"divider\" id=\"r-{{Name}}-divider\"></div>",
  ITEM_TEMPLATE: '<div class="item" id="r-{{Name}}"><div class="header">'+
  '{{Name}}</div><div class="status">{{Status}}</div></div>',

  addItem: function (area, subreddit, status) {
    var items = $("#" + area);
    var placeholder = $("#" + area + "Placeholder");
    if(!placeholder.hasClass("closed")) {
      items.append(UI.DIVIDER);
      placeholder.addClass("closed");
    }
    items.append(UI.ITEM_TEMPLATE.replace(/\{\{Name\}\}/g, subreddit).replace(/\{\{Status\}\}/g, status));
    items.append(UI.DIVIDER.replace(/\{\{Name\}\}/g, subreddit));
  },
  removeItem: function(subreddit) {
    var item = $("#r-" + subreddit);
    var divider = $("#r-" + subreddit + "-divider");
    item.addClass("closing");
    setTimeout(function(){
      item.remove();
      divider.remove();
      UI.CARD_GROUPS.forEach(function(tabName){
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
  },
  initStrings: [
    "Waiting for Imgur...",
    "Contacting The Unicorn Foundation...",
    "Searching for lost pandas...",
    "Questioning existence...",
    "Hacking the database...",
    "Enhancing the vector layer...",
    "Feeding bunnies...",
    "Taking out the trash...",
    "Marvelling at a double rainbow...",
    "Turning it off and back on again..."
  ],
  initPointer: 0,
  getInitializingString: function() {
    var _return = UI.initStrings[UI.initPointer];
    UI.initPointer = Math.floor((Math.random() * UI.initStrings.length));
    return _return;
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
  download: function (subreddit, pageCount) {

    Files.setup();

    send(CONSOLE_LOG, "asdf");
    try{
      Analytics.LogDownload(subreddit, pageCount);
    }catch(e) {
      send(CONSOLE_LOG, e.toString());
    }
    send(CONSOLE_LOG, "asdf");

    var scannedImages = 0;
    var downloadedImages = 0;
    var scannedPages = 0;

    send(UI_ADD_ITEM, subreddit);

    for(var pageNumber = 1; pageNumber < (pageCount + 1); pageNumber++) {
      Imgur.getPage(subreddit, pageNumber, (page) => {
        //send(CONSOLE_LOG_JSON, JSON.stringify(page));

        scannedImages += page.data.length;
        scannedPages ++;

        if(scannedPages == pageCount && scannedImages == 0) {
          send(UI_MOVE_ITEM, subreddit, "failed");
          send(UI_UPDATE_STATUS, subreddit, "subreddit does not exist");
        }

        for(var i = 0; i < page.data.length; i ++) {
          var post = page.data[i];
          var filepath = Files.createPath(post);
          request({
            url: post.link
          }).pipe(fs.createWriteStream(filepath))
          .on('close', () => {

            downloadedImages ++;
            send(UI_UPDATE_STATUS, subreddit, "Downloaded " + downloadedImages + " of " + scannedImages + " images");

            if(scannedPages == pageCount && scannedImages == downloadedImages) {
              send(UI_MOVE_ITEM, subreddit, "finished");
              send(UI_UPDATE_STATUS, subreddit, "" + scannedPages + " page" + (scannedPages == 1 ? "" : "s") + " downloaded (" + downloadedImages + " images)");
            }
          });
        }

      }, ()=> {

      });
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

function search(e) {
  if(e.keyCode != 13) return true;
  var commandStr = $("#search>input").val();
  console.log(commandStr);
  command(commandStr);
  $("#search>input").val("");
  return false;
}
