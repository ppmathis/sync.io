# sync.io
#
# Created by Pascal Mathis at 1/11/14
# License: GPLv3 (Please see LICENSE for more information)

util = require('util')
errors = require('./errors')

module.exports = class MiscUtils
  @ip_ntoa = (ip) ->
    return (ip & 0xFF) + '.' + ((ip >> 8) & 0xFF) + '.' + ((ip >> 16) & 0xFF) + '.' + ((ip >> 24) & 0xFF)

  @ip_aton = (ip) ->
    parts = ip.split('.')
    if parts.length isnt 4 then return -1
    return ((parseInt(parts[3], 10) << 24) >>> 0) + ((parseInt(parts[2], 10) << 16) >>> 0) + ((parseInt(parts[1], 10) << 8) >>> 0) + (parseInt(parts[0], 10) >>> 0)

  @bts_addr = (ip, port) ->
    addr = new Buffer(6)
    addr.writeUInt32LE(@ip_aton(ip), 0)
    addr.writeUInt16BE(port, 4)
    return addr

  @stripKeys = (object, allowedKeys) ->
    clonedObject = util._extend({}, object)
    for key, _ of clonedObject
      if key not in allowedKeys then delete clonedObject[key]
    return clonedObject

