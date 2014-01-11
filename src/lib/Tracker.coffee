# sync.io
#
# Created by Pascal Mathis at 1/11/14
# License: GPLv3 (Please see LICENSE for more information)

errors = require('./utils/errors')
misc = require('./utils/misc')

module.exports = class Tracker

  # Class constructor
  constructor: (@_app) ->
    # Initialize some class variables
    @_shares = {}
    @_handlers =
      get_peers: require('./packets/get_peers')

    # Delete dead peers and shares every 10 seconds
    setInterval(@_deleteDeadPeers, 10000)

  # Delete peers which did not send any announcement since a amount
  # of time which is specified within the configuration.
  _deleteDeadPeers: =>
    NOW = new Date()
    for _, share of @_shares
      for _, peer of share.peers
        if Math.round((NOW - peer.updatedAt) / 1000) > (@_app.getConfig().peerTimeout)
          @_app.getLogger().debug('Deleted dead peer: ' + peer.id)
          delete share.peers[peer.id]
    @_deleteDeadShares()

  # Delete shares if do not contain any peers anymore.
  _deleteDeadShares: =>
    NOW = new Date()
    for _, share of @_shares
      if Object.keys(share.peers).length <= 0
        @_app.getLogger().metric('Deleted dead share: ' + share.id)
        delete @_shares[share.id]

  # Handles incoming packets. This function should only be called by the sync server.
  handlePacket: (packetData, peer) ->
    # Check if packet contains the field 'm' (packet type)
    if not packetData.m? or not packetData.m.toString?
      @_app.getLogger().warning('Discarded tracker packet with invalid payload')
      return

    # Call handler for the given packet type
    packetType = packetData.m.toString().toLowerCase()
    if @_handlers[packetType]?
      @_handlers[packetType](@_app, packetData, peer)
    else
      @_app.getLogger().warning('Discarded tracker packet with unknown packet type: ' + packetType)

  # Announces a share with the given ID. If the share was not
  # announced before, a new share announcement will be created.
  # If it was created already before, the 'updatedAt' field
  # will be updated.
  announceShare: (id) ->
    NOW = new Date()

    if @_shares[id]?
      # Share already exists, just update some fields
      @_app.getLogger().debug('Found existing share announcement: ' + id)
      @_shares[id].updatedAt = NOW
    else
      # Share was not announced create, create a new one
      @_app.getLogger().metric('New share announcement: ' + id)
      @_shares[id] =
        id: id
        createdAt: NOW
        updatedAt: NOW
        peers: {}

  # Announces a peer to the given share. If the share
  # was not announced before, nothing will happen.
  # Otherwise, the peer will be added to the peer list
  # of the share.
  announcePeer: (shareId, peerData) ->
    if not @_shares[shareId]? then return
    NOW = new Date()

    # Debug packet data
    @_app.getLogger().debug('Received peer announcement')
    @_app.getLogger().debug('> Peer identifier: ' + peerData.id)
    @_app.getLogger().debug('> Share identifier: ' + shareId)
    @_app.getLogger().debug('> Local address: ' + peerData.local?.address + ':' + peerData.local?.port)
    @_app.getLogger().debug('> Remote address: ' + peerData.remote?.address + ':' + peerData.remote?.port)

    # Update peer data
    peer = @_shares[shareId].peers[peerData.id]
    peerData.createdAt = if peer?.createdAt? then peer.createdAt else NOW
    peerData.updatedAt = NOW
    @_shares[shareId].peers[peerData.id] = peerData

  # Returns all known shares. Right now, format will
  # only accept 'json', which contains only human-readable data.
  getShares: (format) ->
    result = []

    # Generate share list based on format
    if format is 'json'
      for _, share of @_shares
        tmpShare = misc.stripKeys(share, ['createdAt', 'updatedAt', 'id'])
        tmpShare.peers = @getPeers(tmpShare.id, 'json')
        result.push(tmpShare)

      return result
    else
      throw new errors.ParameterError('Unknown format given: ' + format)
      return null

  # Returns all known peers for the given share. Format
  # must be either 'json' or 'btsync', depending on where you
  # are going to use the result. 'json' only contains human-readable
  # data, while 'btsync' might also contain binary data.
  getPeers: (shareId, format) ->
    # Check if share with given ID exists
    if not @_shares[shareId]?
      @_app.getLogger().debug('Could not get peers for inexistent share: ' + shareId)
      return null
    result = []

    # Generate peer list based on format
    if format is 'json'
      for _, peer of @_shares[shareId].peers
        result.push(misc.stripKeys(peer, ['createdAt', 'updatedAt', 'id', 'local', 'remote']))

      return result
    else if format is 'btsync'
      for _, peer of @_shares[shareId].peers
        result.push(
          p: peer.binId
          a: peer.binRemote
          la: peer.binLocal
        )

      return result
    else
      throw new errors.ParameterError('Unknown format given: ' + format)
      return null

  # Deletes the share with the given ID.
  deleteShare: (id) ->
    @_app.getLogger().metric('Flushed share announcement: ' + id)
    delete @_shares[id]