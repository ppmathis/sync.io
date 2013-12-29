# sync.io
#
# Created by Pascal Mathis at 12/29/13
# License: GPLv3 (Please see LICENSE for more information)

dgram = require('dgram')
bencoding = require('bencoding')
errors = require('./errors')
packets = require('./packets')

BTSYNC_HEADER = new Buffer([66, 83, 89, 78, 67, 0])

module.exports = class SyncServer
  constructor: (@config, @log) ->
    # Create sockets
    @socket = dgram.createSocket('udp4')
    @socket.on('error', @onError)
    @socket.on('message', @onMessage)

    # Initialize some properties
    @trackerData = {}

    # Check for dead pools and shares every 10 seconds
    setInterval(@deleteDeadPeers, 10000)

  deleteDeadPeers: =>
    now = new Date()
    for _, share of @trackerData
      for key, peer of share.peers
        if Math.round((now - peer.updatedAt) / 1000) > (@config.peerTimeout ? 60)
          @log.debug('Deleted dead peer: ' + key)
          delete share.peers[key]

    @deleteDeadShares()

  deleteDeadShares: =>
    now = new Date()
    for key, share of @trackerData
      if Object.keys(share.peers).length <= 0
        @log.log('Deleted dead share: ' + key)
        delete @trackerData[key]

  onError: (err) =>
    @log.error(err)

  onMessage: (packet, rpeer) =>
    # Split package into header and payload parts
    packetHeader = packet.slice(0, BTSYNC_HEADER.length)
    packetPayload = packet.slice(packetHeader.length)

    # Check for valid BTSync header
    if not packetHeader.toString('hex') == BTSYNC_HEADER.toString('hex')
      @log.warning('Destroyed received package with invalid header.')
      return

    # Try to decode packet with bencode
    try
      packetData = bencoding.decode(packetPayload).toJSON()
    catch err
      @log.warning('Destroyed received package with invalid payload.')
      return

    # Dispatch packet to packet handler
    @handlePacket(packetData, rpeer)

  handlePacket: (packet, rpeer) ->
    packetType = packet.m.toString()

    # Try to find a valid packet handler
    switch packetType
      when 'get_peers'
        packets.get_peers(@, rpeer, packet)
      else
        @log.warning('Unknown packet type received: ' + packetType)

  send: (answer, peer) ->
    # Encode answer with bencode and prepend BTSync header
    packetPayload = bencoding.encode(answer)
    packet = new Buffer(packetPayload.length + BTSYNC_HEADER.length)
    BTSYNC_HEADER.copy(packet)
    packetPayload.copy(packet, BTSYNC_HEADER.length)

    # Send packet to peer
    @socket.send(packet, 0, packet.length, peer.port, peer.address)

  listen: (port, address) ->
    @socket.bind(port, address)
    @log.info('sync.io tracker and relay server listening on ' + address + ':' + port)