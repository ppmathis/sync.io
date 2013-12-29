# sync.io
#
# Created by Pascal Mathis at 12/29/13
# License: GPLv3 (Please see LICENSE for more information)

fs = require('fs')
devnull = require('devnull')
pjson = require('../../package.json')
errors = require('./errors')

SyncServer = require('./SyncServer')
WebServer = require('./WebServer')

module.exports = class SyncIO
  constructor: (@configPath) ->
    @initializeLogging()
    @loadConfig()

  initializeLogging: ->
    @log = new devnull(
      namespacing: 0
      level: if process.env.NODE_ENV?.toLowerCase() is 'debug' then 8 else 7
    )
    @log.warning('--- sync.io v' + pjson.version + ' by Pascal Mathis <dev@snapserv.net> ---')
    @log.warning('This application is unofficial and not affiliated or related to BitTorrent, Inc.')

  loadConfig: ->
    try
      configData = fs.readFileSync(@configPath)
      @config = JSON.parse(configData)
    catch err
      throw new errors.ConfigurationError('Could not load configuration file!\n' + err)

  run: ->
    @webServer = new WebServer(@)
    @webServer.listen(@config.webPort ? 4000, @config.webAddress ? null)

    @syncServer = new SyncServer(@config, @log)
    @syncServer.listen(@config.serverPort ? 3000, @config.serverAddress ? null)