"use strict";

var RelayClient = require("./lib/relayclient");

var c = new RelayClient({
  ca: ['easyrsa/keys/ca.crt'],
  key: 'easyrsa/keys/client.key',
  cert: 'easyrsa/keys/client.crt',
  port: 8000,
  host: "localhost"
});

c.on('connect', function (err) {
  console.log('Connected to server');
  process.stdin.pipe(this.socket);
});

console.log("STARTED");