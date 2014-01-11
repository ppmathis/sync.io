# sync.io
#
# Created by Pascal Mathis at 1/11/14
# License: GPLv3 (Please see LICENSE for more information)

dgram = require('dgram')
bencoding = require('bencoding')

module.exports = class SyncServer
  # Every packet from BTSync starts with "BSYNC\0"
  PACKET_HEADER = new Buffer([66, 83, 89, 78, 67, 0])

  # Class constructor
  constructor: (@_app) ->
    # Initialize server socket
    @_socket = dgram.createSocket('udp4')
    @_socket.on('error', @_onSocketError)
    @_socket.on('message', @_onSocketMessage)

  _onSocketError: (err) =>
    @_app.getLogger().error('Socket error: ' + err.toString?())

  _onSocketMessage: (packet, peer) =>
    [packetHeader, packetPayload] = @_parsePacketHeader(packet)

    # It is really hard to distinguish between packets which are meant
    # for the tracker server and others which are meant for the relay server.
    # There isn't any header, just the payload is different.
    #
    # However, there is a 'dirty' way to determine the packet type:
    # Packets for the relay server start with the peer id (20bytes)
    # followed by bencoded data. However, tracker packets immediately
    # start with bencoded data. That's why we try to decode the
    # data, and if it fails, it must be a relay server packet.
    packetData = bencoding.decode(packetPayload)
    if packetData.length isnt 0
      @_app.getTracker().handlePacket(packetData.toJSON(), peer)
    else
      @_app.getLogger().warning('Relay server not yet implemented. Packet discarded.')
      # relayPeer = packetPayload.slice(0, 20).toString('hex')
      # packetPayload = packetPayload.slice(20)
      # @_app.getRelay().handlePacket(packetPayload, relayPeer)

  _parsePacketHeader: (packet) ->
    # Split header from payload
    packetHeader = packet.slice(0, PACKET_HEADER.length)
    packetPayload = packet.slice(PACKET_HEADER.length)

    # Verify if header is valid
    if not packetHeader.toString('hex') is PACKET_HEADER.toString('hex')
      @_app.getLogger().debug('Expected packet header: ' + PACKET_HEADER.toString('hex'))
      @_app.getLogger().debug('Received packet header: ' + packetHeader.toString('hex'))
      @_app.getLogger().warning('Discarded packet with invalid header.')

    # Return header and payload
    return [packetHeader, packetPayload]

  # Starts the sync server and listens at the given address and port
  listen: (port, address) ->
    @_socket.bind(port, address)
    @_app.getLogger().info('Sync server listening on ' + address + ':' + port)

  # Sends an answer packet back to the given peer
  sendAnswer: (answerData, peer) ->
    # Encode answer data with bencode and prepend BTSync header
    packetPayload = bencoding.encode(answerData)
    packet = new Buffer(PACKET_HEADER.length + packetPayload.length)

    PACKET_HEADER.copy(packet)
    packetPayload.copy(packet, PACKET_HEADER)

    # Send packet back to peer
    @_socket.send(packet, 0, packet.length, peer.port, peer.address)