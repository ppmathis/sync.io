'use strict';
var dejavu = require('dejavu');
var LoggerService = require('./util/LoggerService');
var ConfigManager = require('./util/ConfigManager');

var SyncIO = dejavu.Class.declare({
	$name: 'SyncIO',

	__$logger: null,
	__$config: null,

	initialize: function() {
		this.__$loggerService = new LoggerService();
		this.__$configManager = new ConfigManager(this.__$loggerService);
	},

	run: function(configurationFile) {
		this.__$configManager.loadFromFile(configurationFile);
	}
});

module.exports = SyncIO;