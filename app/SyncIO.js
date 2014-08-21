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

	/* Module instances */
	__$eventSystem: null,
	__$loggerService: null,
	__$configManager: null,
	__$shareManager: null,
	__$configServer: null,
	__$trackerManager: null,

	/**
	 * Initializes a new Sync.IO instance. This function won't do
	 * anything, it just prepares the Sync.IO server by instantiating
	 * some required child modules. Call run() to actually execute this
	 * application.
	 *
	 * @constructor
	 */
	initialize: function() {
		this.__$eventSystem = new events.EventEmitter();
		this.__$loggerService = new LoggerService();
		this.__$configManager = new ConfigManager(this.__$loggerService);
		this.__$configServer = new ConfigServer(this.__$loggerService, this.__$configManager);
		this.__$trackerServer = new TrackerServer(this.__$loggerService, this.__$eventSystem);
		this.__$trackerManager = new TrackerManager(this.__$loggerService, this.__$eventSystem);
	},

	/**
	 * Run this Sync.IO instance with the provided configuration file.
	 * This file should only be called once, otherwise bad things might
	 * happen.
	 * 
	 * @param  {string} configurationFile Path to configuration file
	 */
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