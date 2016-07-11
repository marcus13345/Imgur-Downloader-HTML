
var cluster = require('cluster');
module.exports = {
  READY_MESSAGE: 'READY_SEND_COMMAND',
  CONSOLE_LOG: 'CONSOLE_LOG',
  CONSOLE_LOG_JSON: 'CONSOLE_LOG_JSON',
  UI_ADD_ITEM: 'UI_ADD_ITEM',
  UI_UPDATE_STATUS: 'UI_UPDATE_STATUS',
  UI_MOVE_ITEM: 'UI_MOVE_ITEM',
  send: function() {
    var args = Array.prototype.slice.call(arguments);
    if(args.length < 1) return;
    if(cluster.isMaster) {
      console.log("tried logging: [" + args.join(", ") + "] from master thread.");
    }else {
      process.send(args.join("\r\n"));
    }
  }
}
