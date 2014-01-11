# sync.io
#
# Created by Pascal Mathis at 12/29/13
# License: GPLv3 (Please see LICENSE for more information)

express = require('express')
path = require('path')
fs = require('fs')
pjson = require('../../package.json')

module.exports = class WebServer

  # Class constructor
  constructor: (@_app) ->
    # Setup express.js
    @_webapp = express()
    @_webapp.use(express.methodOverride());

    @_registerRoutes()

  # Register all routes with express.js
  _registerRoutes: ->
    # Route for static files within the 'web' directory
    @_webapp.use('/', express.static(path.join(__dirname, '..', '..', 'web')))

    # Returns the current version of sync.io
    @_webapp.get('/api/version', (req, res) =>
      res.send(success: true, version: pjson.version)
    )

    # Returns all announced shares
    @_webapp.get('/api/shares', (req, res) =>
      shares = @_app.getTracker().getShares('json')
      res.send(success: true, payload: shares)
    )

    # Deletes the share with the given ID
    @_webapp.get('/api/flush/:id', (req, res) =>
      @_app.getTracker().deleteShare(req.params.id)
      res.send(success: true)
    )

  # Starts the web server and listens at the given address and port
  listen: (port, address) ->
    @_webapp.listen(port, address)
    @_app.getLogger().info('Web server listening on ' + address + ':' + port)