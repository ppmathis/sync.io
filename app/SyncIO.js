'use strict';
var dejavu = require('dejavu');
var LoggerService = require('./util/LoggerService');
var ConfigManager = require('./util/ConfigManager');
var ConfigServer = require('./btsync/ConfigServer');
var TrackerServer = require('./btsync/TrackerServer');

var SyncIO = dejavu.Class.declare({
	$name: 'SyncIO',

	__$loggerService: null,
	__$configManager: null,
	__$configServer: null,
	__$trackerServer: null,

	initialize: function() {
		this.__$loggerService = new LoggerService();
		this.__$configManager = new ConfigManager(this.__$loggerService);
		this.__$configServer = new ConfigServer(this.__$loggerService, this.__$configManager);
		this.__$trackerServer = new TrackerServer(this.__$loggerService);
	},

	run: function(configurationFile) {
		this.__$configManager.loadFromFile(configurationFile);
		if(this.__$configManager.get('serveConfig')) {
			this.__$configServer.listen(this.__$configManager.get('configPort'));
		}
		if(this.__$configManager.get('serveTracker')) {
			this.__$trackerServer.listen(this.__$configManager.get('trackerPort'));
		}
	}
});

module.exports = SyncIO;