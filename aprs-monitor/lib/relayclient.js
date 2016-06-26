"use strict";

var tls = require('tls'),
    fs = require('fs'),
    util = require('util'),
    events = require('events');

var RelayClient = function(options) {
  var _this = this;

  this.ca = [];
  for (var c in options.ca) {
    this.ca.push(fs.readFileSync(options.ca[c]));
  }

  this.port = options.port;
  this.host = options.host;
  this.reconnectTime = options.reconnectTime || 5000;
  this.key = fs.readFileSync(options.key);
  this.crt = fs.readFileSync(options.cert);
  events.EventEmitter.call(this);
  this._connect();
};

util.inherits(RelayClient, events.EventEmitter);

RelayClient.prototype._connect = function() {
  var _this = this;
  this.socket = tls.connect(this.port, this.host,
    {
      ca : this.ca,
      key: this.key,
      cert: this.crt,
      rejectUnauthorized: false
    }, function () {
      _this.emit('connect', null);
      if (!_this.socket.authorized) {
        console.log("TLS authorization error:", _this.socket.authorizationError);
        _this.emit("socket_error", _this.socket.authorizationError);
      }
  });

  this.socket.on("error", function (err) {
    _this._handleError(err);
  });

  this.socket.on("close", function () {
    _this._handleClose();
  });

  this.socket.on("data", function (data) {
    _this.emit("data", data);
  });
};

RelayClient.prototype._handleError = function(error) {
  console.log("Socket Error:", error.toString());
  this.emit('socket_error', error);
};

RelayClient.prototype._handleClose = function() {
  var _this = this;
  console.log("Connection closed. Trying to connect again in " + this.reconnectTime);
  this.emit('disconnect', null);
  setTimeout(function () {
    _this._connect();
  }, this.reconnectTime);
};

RelayClient.prototype.write = function (text) {
  if (this.socket.writable) {
    this.socket.write(text);
  }
}

module.exports = RelayClient;