'use strict';
var dejavu = require('dejavu');
var http = require('http');

var ConfigServer = dejavu.Class.declare({
	$name: 'ConfigServer',

	__httpServer: null,
	__cachedConfig: null,

	__$loggerService: null,
	__$configManager: null,

	initialize: function($loggerService, $configManager) {
		this.__httpServer = http.createServer(this.__requestHandler);
		this.__$loggerService = $loggerService;
		this.__$configManager = $configManager;
	},

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