var $ = require('jquery');
var remote = require('remote');
var path = require('path');
var fs = require('fs');
var os = require('os');
//var Worker = require('webworker-threads').Worker;
var cluster = require('cluster');
var http = require('http');
var numCPUs = 4;

var cluster = require('cluster'),
    os      = require('os');

var data = {"downloads":[
  {
    "subreddit": "emmawatson",
    "properName": "Emma Watson",
    "pages":10,
    "scanned": 240,
    "downloaded":156
  },
  {
    "subreddit": "emmastone",
    "properName": "Emma Stone",
    "pages":10,
    "scanned": 180,
    "downloaded":74
  }
]};

const CARD_GROUPS = ["downloading", "finished", "failed"];
const DIVIDER = "<div class=\"divider\" id=\"r-{{Name}}-divider\"></div>";
const ITEM_TEMPLATE = '<div class="item" id="r-{{Name}}"><div class="header">{{Name}}</div><div class="status">{{Status}}</div></div>';

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
    $.ajax({
      url:"https://api.imgur.com/3/gallery/r/" + subreddit + "/" + (page - 1) + ".json",
      headers: {
        "Authorization": "client-id 76535d44f1f94da"
      },
      error: failCallback
    }).success(function(result){
      callback(result);
    });
  }
};

var Commands = {
  download: function (subreddit, pages) {
    UI.addItem("downloading", subreddit, "Initializing download...");

    //check the subreddit's existence
    Imgur.getPage(subreddit, 1, function(page){
      if (page.data.length == 0) {
          UI.moveItem(subreddit, "failed");
          UI.changeStatus(subreddit, "Subreddit does not exist");
          return;
      }

    }, function() {
        UI.moveItem(subreddit, "failed");
        UI.changeStatus(subreddit, "Imgur Responded with an internal error");
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
  /*
  new Worker(function(){
    //we're going to assume the str is just the name of a page...
    Commands.download(str, 1);
  });*/

  setTimeout(function() {
    //we're going to assume the str is just the name of a page...
    Commands.download(str, 1);
  }, 0);
};

function search(e) {
  if(e.keyCode != 13) return true;
  var commandStr = $("#search>input").val();
  console.log(commandStr);
  command(commandStr);
  $("#search>input").val("");
  return false;
}


function call(cmd, args) {
  var spawn = require('child_process').spawn;
  var ls = spawn(cmd, args);

  ls.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  ls.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  ls.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });

}



//TESTING FUCNTIONS
command("emmawatson");
command("nonexistantsubredditkljhdsfgkh");
