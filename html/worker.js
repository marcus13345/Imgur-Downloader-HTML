var $ = require('jquery');

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
    postMessage('UI.addItem("downloading", "'+subreddit+'", "Initializing download...")');

    //check the subreddit's existence
    Imgur.getPage(subreddit, 1, function(page){
      if (page.data.length == 0) {
          postMessage('UI.moveItem("'+subreddit+'", "failed")');
          postMessage('UI.changeStatus("'+subreddit+'", "Subreddit does not exist")');
          return;
      }

    }, function() {
        postMessage('UI.moveItem("'+subreddit+'", "failed")');
        postMessage('UI.changeStatus("'+subreddit+'", "Imgur Responded with an internal error")');
    });


  }
};
this.onmessage = function(e){
  var str = e.data;

  //now treat this like a command function.
  Commands.download(str, 1);
};
