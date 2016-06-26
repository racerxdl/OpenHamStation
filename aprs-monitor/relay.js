#!/usr/bin/node

"use strict";

var tls = require('tls'),
    fs = require('fs'),
    express = require('express'),
    net = require('net');

var io;
var tcpClients = [];

// APRS Receiver

var options = {
  ca: [fs.readFileSync('easyrsa/keys/ca.crt')],
  key: fs.readFileSync('easyrsa/keys/localhost.key'),
  cert: fs.readFileSync('easyrsa/keys/localhost.crt'),
  requestCert: true,
  rejectUnauthorized: true
};

var buff = "";

tls.createServer(options, function (s) {
  var cert = s.getPeerCertificate();
  console.log("Client \"" + cert.subject.CN + "\" connected.");
  console.log("Cipher: ",  s.getCipher());
  console.log("Address: ", s.address());
  console.log("Remote address: ", s.remoteAddress);
  console.log("Remote port: ", s.remotePort);

  s.on('data', function(data) {
    data = data.toString();
    console.log(data);
    io.emit('aprs', data);
    for (var i in tcpClients) {
      try {
        tcpClients[i].write(data + "\r\n");
      } catch (e) {
        console.log("Error sending Socket to " + tcpClients[i].name + ": ",e);
      }
    }
  });

  s.on("error", function (err) {
    console.log("Error:", err.toString());
  });

}).listen(8000);

// WebSocket Transmitter

var app = express();
var http = require('http').Server(app);
io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

// Start a TCP Server
net.createServer(function (socket) {
  socket.name = socket.remoteAddress + ":" + socket.remotePort 
  tcpClients.push(socket);
  socket.on('end', function () {
    tcpClients.splice(tcpClients.indexOf(socket), 1);
  });
}).listen(4000);
