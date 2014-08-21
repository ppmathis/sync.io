'use strict';
var events = require('events');
var dejavu = require('dejavu');
var LoggerService = require('./util/LoggerService');
var ConfigManager = require('./util/ConfigManager');
var ConfigServer = require('./btsync/servers/ConfigServer');
var TrackerServer = require('./btsync/servers/TrackerServer');
var TrackerManager = require('./btsync/TrackerManager');

var SyncIO = dejavu.Class.declare({
	$name: 'SyncIO',

	__$eventSystem: null,
	__$loggerService: null,
	__$configManager: null,
	__$shareManager: null,
	__$configServer: null,
	__$trackerManager: null,

	initialize: function() {
		this.__$eventSystem = new events.EventEmitter();
		this.__$loggerService = new LoggerService();
		this.__$configManager = new ConfigManager(this.__$loggerService);
		this.__$configServer = new ConfigServer(this.__$loggerService, this.__$configManager);
		this.__$trackerServer = new TrackerServer(this.__$loggerService, this.__$eventSystem);
		this.__$trackerManager = new TrackerManager(this.__$loggerService, this.__$eventSystem);
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