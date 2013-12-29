# sync.io
#
# Created by Pascal Mathis at 12/29/13
# License: GPLv3 (Please see LICENSE for more information)

bencoding = require('bencoding')

ip_ntoa = (ip) ->
  return (ip & 255) + '.' + ((ip >> 8) & 255) + '.' + ((ip >> 16) & 255) + '.' + ((ip >> 24) & 255)

peerAddress = (peer) ->
  parts = peer.address.split('.')
  ip = (parseInt(parts[3], 10) << 24) >>> 0
  ip += (parseInt(parts[2], 10) << 16) >>> 0
  ip += (parseInt(parts[1], 10) << 8) >>> 0
  ip += parseInt(parts[0], 10) >>> 0

  address = new Buffer(6)
  address.writeUInt32LE(ip, 0)
  address.writeUInt16LE(peer.port, 4)
  return address

module.exports = (server, rpeer, packet) ->
  # Read some packet data
  peerIdentifierHex = packet.peer.toString('hex')
  shareHashHex = packet.share.toString('hex')

  # Get remote and local peer address and port
  rpeer =
    address: rpeer.address
    port: rpeer.port
  lpeer =
    address: ip_ntoa(packet.la.readUInt32LE(0))
    port: packet.la.readUInt16LE(2)

  # Print debug information about received packet
  server.log.debug('Received packet: get_peers')
  server.log.debug('> Peer identifier: ' + peerIdentifierHex)
  server.log.debug('> Share hash: ' + shareHashHex)
  server.log.debug('> Local peer address: ' + lpeer.address + ':' + lpeer.port)
  server.log.debug('> Remote peer address: ' + rpeer.address + ':' + rpeer.port)

  # Search for share in tracker data
  if server.trackerData[shareHashHex]?
    server.log.debug('Found existing share announcement: ' + shareHashHex)
    share = server.trackerData[shareHashHex]
  else
    server.log.log('New share announced: ' + shareHashHex)
    share = server.trackerData[shareHashHex] =
      createdAt: new Date()
      updatedAt: null
      peers: {}

  # Update share info
  share.updatedAt = new Date()

  # Add client to peer list if missing
  if share.peers[peerIdentifierHex]?
    peer = share.peers[peerIdentifierHex]
  else
    peer = share.peers[peerIdentifierHex] =
      createdAt: new Date()
      updatedAt: null
      id: packet.peer
      rpeer: null
      lpeer: null

  # Update peer info
  # l/rpeer[0] = string representation of IP address
  # l/rpeer[1] = numeric representation of IP address
  peer.updatedAt = new Date()
  peer.rpeer = [rpeer, peerAddress(rpeer)]
  peer.lpeer = [lpeer, peerAddress(lpeer)]

  # Generate answer object
  answer =
    m: 'peers'
    share: packet.share
    time: Math.round((new Date()).getTime() / 1000)
    ea: peer.rpeer[1]
    peers: []

  # Add peers to answer packet
  for _, peer of share.peers
    answer.peers.push(
      p: peer.id,
      a: peer.rpeer[1]
      la: peer.lpeer[1]
    )

  # Send answer to peer
  server.send(answer, rpeer)