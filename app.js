var express = require('express')
, app = express()
, _ = require('underscore')
, consolidate = require('consolidate')
, server = require('http').createServer(app)
, handlebars = require('handlebars')
, io = require('socket.io').listen(server)
, fs = require('fs');

io.set('log level', 1);

app.engine('hbs', consolidate.handlebars);
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'handlebars');
});

fs.readdirSync(__dirname + '/views').forEach(function(filename) {
  var content = fs.readFileSync(__dirname + '/views/' + filename)
    , name = filename.substr(0, filename.lastIndexOf('.'));

  handlebars.registerPartial(name, content.toString());
});

app.use('/', express.static(__dirname + '/public'));
app.use('/views', express.static(__dirname + '/views'));

app.get('/', function(req, res) {
  res.render('layout.hbs', {'name': 'test', 'messages': [
    {content: "Test"},
    {content: "Something else"}
  ]});
});

io.sockets.on('connection', function (socket) {
  socket.on('set nickname', function(name) {
    socket.set('name', name, function() {
      socket.emit('ready');
    });
  });

  var sockets = [];
  for (i in io.sockets.sockets) {
    sockets.push({
      id: i
    });
  }


  io.sockets.emit('connection', {sockets: sockets});

  socket.on('disconnect', function () {
    console.log('DISCONNECT');
      var sockets = [];
      for (i in io.sockets.sockets) {
        sockets.push({
          id: i
        });
      }

    io.sockets.emit('disconnect', {sockets: sockets});
  });

  socket.on('message', function (data) {
    io.sockets.emit('message', data);
  });

});

server.listen(8888);
