var cluster = require('cluster');

if (cluster.isWorker) {
  //so be like ay, im fucking here
  console.log('Worker ' + (process.pid % 10) + ' has started.');

  process.send('This is from worker ' + (process.pid % 10) + '.');

  //so when we get a message
  process.on('message', function(msg) {
    console.log('Master -> Worker: ', msg);
  });

}

if (cluster.isMaster) {
  console.log('Master ' + (process.pid % 10) + ' has started.');

  //one last thing, lets make 10 workers now instead.
  for (var i = 0; i < 10; i++) {
      var worker = cluster.fork(); //recievving from the worker, i think
      worker.on('message', function(msg) {
        console.log("Worker -> Master: ", msg);
      });

      // send master -> worker                                                      \/ its this one
      worker.send('This is from master ' + (process.pid % 10) + ' to worker ' + (worker.process.pid % 10) + '.');
      worker.send("" + (worker.process.pid % 10));
  }

  //some cleanup shit, fuck it
  cluster.on('death', function(worker) {
    console.log('Worker ' + (worker.process.pid % 10) + ' died.');
  });

}
