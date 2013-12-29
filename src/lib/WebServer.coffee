# sync.io
#
# Created by Pascal Mathis at 12/29/13
# License: GPLv3 (Please see LICENSE for more information)

express = require('express')
path = require('path')
fs = require('fs')
pjson = require('../../package.json')

module.exports = class WebServer
  constructor: (@app) ->
    @web = express()
    @registerRoutes()

  registerRoutes: ->
    @web.use('/', express.static(path.join(__dirname, '..', '..', 'web')))

    @web.get('/api/version', (req, res) =>
      res.send({version: pjson.version})
    )

    @web.get('/api/flush/:sid', (req, res) =>
      shares = @app.syncServer.trackerData
      if shares[req.params.sid]?
        delete shares[req.params.sid]
      res.send({success: true});
    )

    @web.get('/api/shares', (req, res) =>
      shares = []

      for shareId, share of @app.syncServer.trackerData
        # Only copy a few attributes, binary data shouldn't be sent over the API
        tmp = (
          createdAt: share.createdAt
          updatedAt: share.updatedAt
          id: shareId
          peers: []
        )

        # Same applies for the peer list, binary data shouldn't be sent over the API
        for peerId, peer of share.peers
          tmp.peers.push(
            createdAt: peer.createdAt
            updatedAt: peer.updatedAt
            id: peerId
            rpeer: peer.rpeer[0]
            lpeer: peer.lpeer[0]
          )
        shares.push(tmp)

      res.send({shares: shares})
    )

  listen: (port, address) ->
    @web.listen(port, address)
    @app.log.info('sync.io web server listening on ' + address + ':' + port)