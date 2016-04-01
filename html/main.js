var $ = require('jquery');

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

function updateItems() {
  //print out items to downloads section thing
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
  }
}

function getPage(subreddit) {
  return JSON.parse($.ajax({
    url:"https://api.imgur.com/3/gallery/r/" + subreddit + "/0.json",
    async: false,
    headers: {
      "Authorization": "client-id 76535d44f1f94da"
    }
  }).responseText);
}

var poop = getPage("emmawatson");

console.log(poop);

function command(str) {

  setTimeout(function(){

  }, 0);

}

function download(subreddit, pages) {
  UI.addItem("downloading", "subreddit", "Initializing download...");
}
