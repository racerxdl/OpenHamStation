#!/usr/bin/node

"use strict";

var tls = require('tls'),
    fs = require('fs'),
    express = require('express')

var io;

var options = {
  ca: [fs.readFileSync('easyrsa/keys/ca.crt')],
  key: fs.readFileSync('easyrsa/keys/localhost.key'),
  cert: fs.readFileSync('easyrsa/keys/localhost.crt'),
  requestCert: true,
  rejectUnauthorized: true
};

tls.createServer(options, function (s) {
  var cert = s.getPeerCertificate();
  console.log("Client \"" + cert.subject.CN + "\" connected.");
  console.log("Cipher: ",  s.getCipher());
  console.log("Address: ", s.address());
  console.log("Remote address: ", s.remoteAddress);
  console.log("Remote port: ", s.remotePort);

  s.on('data', function(data) {
    var d = data.toString().split("\n").filter(function(n){ return n != "" });
    for (var i in d) {
      console.log(d[i]);
      io.emit('aprs', d[i]);
    }
  });

  s.on("error", function (err) {
    console.log("Error:", err.toString());
  });

}).listen(8000);

var app = express();
var http = require('http').Server(app);
io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
