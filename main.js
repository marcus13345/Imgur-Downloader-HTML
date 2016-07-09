'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let splashscreen;
let mainWindow;


var Analytics = require("./html/Analytics.js");
var version = require("./html/version.js");
var request = require("request");

function openSplashScreen () {
  Analytics.LogEvent(Analytics.EVENTS.SESSION_STARTED);
  var startTime = Date.now();
  splashscreen = new BrowserWindow({width: 800, height: 400, show: false, frame: false});
  splashscreen.setMenu(null);
  //splashscreen.webContents.openDevTools();
  // and load the index.html of the app.
  splashscreen.loadUrl('file://' + __dirname + '/html/splashscreen.html');
	// splashscreen.webContents.openDevTools();
  splashscreen.webContents.on('did-finish-load', function() {
    setTimeout(function(){
      splashscreen.show();
    	checkUpdates();
    }, 40);
  });

}

function checkUpdates() {

  request('http://api.mandworks.com/subsavur/GetVersion.php', function(a, b, c){
    var newVersion = JSON.parse(c).version;
    if(version != newVersion) {
      var startTime = Date.now();
      splashscreen = new BrowserWindow({width: 300, height: 200, show: false, frame: false});
      splashscreen.setMenu(null);
      //splashscreen.webContents.openDevTools();
      // and load the index.html of the app.
      splashscreen.loadUrl('file://' + __dirname + '/html/update.html');
      // splashscreen.webContents.openDevTools();
      splashscreen.webContents.on('did-finish-load', function() {
        setTimeout(function(){
          splashscreen.show();
          //checkUpdates();
        }, 40);
      });
    }
  });

}

function openMainWindow() {

  // splashscreen.webContents.openDevTools();
  console.error(Date.now() - startTime);
  var startTime = Date.now();
  mainWindow = new BrowserWindow({width: 1010, height: 600, show: false});
  mainWindow.setMenu(null);
  //mainWindow.webContents.openDevTools();
  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/html/index.html');
  // mainWindow.webContents.openDevTools();
  mainWindow.webContents.on('did-finish-load', function() {
    setTimeout(function(){
      mainWindow.show();
      splashscreen.close();
      console.error(Date.now() - startTime);
    }, 40);
  });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', openSplashScreen);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	//if (process.platform !== 'darwin') {
    Analytics.LogEvent(Analytics.EVENTS.SESSION_ENDED, function(){app.quit()});

	//}
});

app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});
