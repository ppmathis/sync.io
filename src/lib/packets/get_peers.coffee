# sync.io
#
# Created by Pascal Mathis at 1/11/14
# License: GPLv3 (Please see LICENSE for more information)

misc = require('../utils/misc')

module.exports = (app, packetData, peer) ->
  # Check for required packet fields
  if not packetData.share? or not packetData.peer? or not packetData.la?
    app.getLogger().warning('Discarded packet with type \'get_peers\' because of missing data')
    return

  # Convert peer and share identifier to hex notation
  peerIdentifierHex = packetData.peer.toString('hex')
  shareIdentifierHex = packetData.share.toString('hex')

  # Parse peer data
  peerData =
    id: peerIdentifierHex
    binId: packetData.peer
    local:
      address: misc.ip_ntoa(packetData.la.readUInt32LE(0))
      port: packetData.la.readUInt16BE(4)
    binLocal: packetData.la
    remote:
      address: peer.address
      port: peer.port
    binRemote: misc.bts_addr(peer.address, peer.port)

  # Announce share and peer to tracker
  app.getTracker().announceShare(shareIdentifierHex)
  app.getTracker().announcePeer(shareIdentifierHex, peerData)

  # Send peer list back
  answerData =
    m: 'peers'
    share: packetData.share
    time: Math.round((new Date()).getTime() / 1000)
    ea: peerData.binRemote
    peers: app.getTracker().getPeers(shareIdentifierHex, 'btsync')

  # Send answer back to client
  app.getSyncServer().sendAnswer(answerData, peer)