# sync.io
#
# Created by Pascal Mathis at 12/29/13
# License: GPLv3 (Please see LICENSE for more information)

fs = require('fs')
devnull = require('devnull')
pjson = require('../../package.json')
errors = require('./utils/errors')

Tracker = require('./Tracker')
Relay = require('./Relay')
SyncServer = require('./SyncServer')
WebServer = require('./WebServer')

module.exports = class SyncIO

  # Class constructor
  constructor: () ->
    # Initialize some private variables
    @_tracker = new Tracker(@)
    @_relay = new Relay(@)

    @initializeLogging()

  # Initialize the application-wide logger and print a welcome message
  initializeLogging: ->
    @_logger = new devnull(
      namespacing: 0
      level: if process.env.NODE_ENV?.toLowerCase() is 'debug' then 8 else 7
    )
    @_logger.warning('--- sync.io v' + pjson.version + ' by Pascal Mathis <dev@snapserv.net> ---')
    @_logger.warning('This application is unofficial and not affiliated or related to BitTorrent, Inc.')

  # Load the app configuration from the given file. This function can only be
  # called once, existing configuration values will always be overwritten by
  # the last loaded file.
  loadConfig: (configFile) ->
    try
      configData = fs.readFileSync(configFile)
      @_config = JSON.parse(configData)
    catch err
      throw new errors.ConfigurationError('Could not load configuration file!\n' + err)

  # Start the application. This method starts the web and sync server at the ports
  # specified within the configuration.
  run: ->
    @_webServer = new WebServer(@)
    @_webServer.listen(@_config.webServerPort ? 4000, @_config.webServerAddress ? null)
    @_syncServer = new SyncServer(@)
    @_syncServer.listen(@_config.syncServerPort ? 3000, @_config.syncServerAddress ? null)

  # Various getters
  getConfig: -> return @_config
  getLogger: -> return @_logger
  getTracker: -> return @_tracker
  getRelay: -> return @_relay
  getWebServer: -> return @_webServer
  getSyncServer: -> return @_syncServer