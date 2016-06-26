#!/usr/bin/nodejs

"use strict";

var RelayClient = require("./lib/relayclient");

var c = new RelayClient({
  ca: ['ca.crt'],
  key: 'client.key',
  cert: 'client.crt',
  port: 8000,
  host: "localhost"
});

var readline = require('readline');

var LB = "\r\n";
var buff = "";

c.on('connect', function (err) {
  var _this = this;
  console.log('Connected to server');
  process.stdin.on('data', function(data) {
    data = data.toString();
    for (var i=0; i<data.length; i++) {
      if (data[i] == '\n') {
        console.log("Sending data: " + buff);
        _this.write(buff);
        buff = "";
      } else if (data[i] != '\r') {
        buff += data[i];
      }
    }
  });
});

console.log("STARTED");