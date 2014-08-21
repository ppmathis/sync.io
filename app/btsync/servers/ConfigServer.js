'use strict';
var dejavu = require('dejavu');
var http = require('http');

var ConfigServer = dejavu.Class.declare({
	$name: 'ConfigServer',

	/* Private variables */
	__httpServer: null,
	__cachedConfig: null,

	/* Module instances */
	__$loggerService: null,
	__$configManager: null,

	/**
	 * Initializes a new ConfigServer instance. Remember though
	 * that the server won't get started until executing .listen()
	 *
	 * @constructor
	 * @param  {LoggerService} $loggerService
	 * @param  {ConfigManager} $configManager
	 */
	initialize: function($loggerService, $configManager) {
		this.__$loggerService = $loggerService;
		this.__$configManager = $configManager;

		this.__httpServer = http.createServer(this.__requestHandler);
	},

	/**
	 * This method tries to start listening on the specified port.
	 * If that operation should fail, an error will be logged and
	 * the process will get automatically killed with an exit code
	 * of 3.
	 * 
	 * @param  {nubmer} port
	 */
	listen: function(port) {
		this.__httpServer.on('listening', function() {
			this.__$loggerService.info('ConfigServer started listening on port ' + port);
		}.$bind(this));

		this.__httpServer.on('error', function(err) {
			this.__$loggerService.error('ConfigServer occured a fatal socket error on port ' + port);
			this.__$loggerService.error(err.toString());
			this.__$loggerService.error('The application will exit now.');
			process.exit(3);	
		}.$bind(this));

		this.__httpServer.listen(port);
	},

	/**
	 * As the official BTSync client expects the configuration to be
	 * in a specific format, this method reads the sync.io configuration
	 * and generates an appropriate JSON object. To further improve
	 * performance, the JSON object gets cached, so runtime changes
	 * won't be visible till restarting the server.
	 *
	 * @private
	 * @return {object} JSON object with the correct BTSync structure
	 */
	__getConfig: function() {
		if(this.__cachedConfig) return this.__cachedConfig;
		this.__cachedConfig = { trackers: [], relays: [] };

		var syncConfig = this.__$configManager.get('syncConfig');
		if(syncConfig.trackers) {
			syncConfig.trackers.forEach(function(tracker) {
				this.__cachedConfig.trackers.push({ addr: tracker });
			}.$bind(this));
		}
		if(syncConfig.relays) {
			syncConfig.relays.forEach(function(relay) {
				this.__cachedConfig.relays.push({ addr: relay });
			}.$bind(this));
		}

		return this.__cachedConfig;
	},

	/**
	 * This method serves as the request handler for the HTTP server.
	 * It is really basic and does not care at all, which data got
	 * actually sent by the client. It will always just reply with
	 * a BTSync configuration response.
	 *
	 * @private
	 * @param  {object} req HTTP request
	 * @param  {object} res HTTP response
	 */
	__requestHandler: function(req, res) {
		res.writeHead(200, {
			'Content-Type': 'application/json',
			'Server': 'sync.io'
		});
		res.write(JSON.stringify(this.__getConfig()));
		res.end();
	}.$bound()
});

module.exports = ConfigServer;