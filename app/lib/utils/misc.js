// Generated by CoffeeScript 1.6.3
(function() {
  var MiscUtils, errors, util,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  util = require('util');

  errors = require('./errors');

  module.exports = MiscUtils = (function() {
    function MiscUtils() {}

    MiscUtils.ip_ntoa = function(ip) {
      return (ip & 0xFF) + '.' + ((ip >> 8) & 0xFF) + '.' + ((ip >> 16) & 0xFF) + '.' + ((ip >> 24) & 0xFF);
    };

    MiscUtils.ip_aton = function(ip) {
      var parts;
      parts = ip.split('.');
      if (parts.length !== 4) {
        return -1;
      }
      return ((parseInt(parts[3], 10) << 24) >>> 0) + ((parseInt(parts[2], 10) << 16) >>> 0) + ((parseInt(parts[1], 10) << 8) >>> 0) + (parseInt(parts[0], 10) >>> 0);
    };

    MiscUtils.bts_addr = function(ip, port) {
      var addr;
      addr = new Buffer(6);
      addr.writeUInt32LE(this.ip_aton(ip), 0);
      addr.writeUInt16LE(port, 4);
      return addr;
    };

    MiscUtils.stripKeys = function(object, allowedKeys) {
      var clonedObject, key, _;
      clonedObject = util._extend({}, object);
      for (key in clonedObject) {
        _ = clonedObject[key];
        if (__indexOf.call(allowedKeys, key) < 0) {
          delete clonedObject[key];
        }
      }
      return clonedObject;
    };

    return MiscUtils;

  })();

}).call(this);