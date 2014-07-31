'use strict';
var dejavu = require('dejavu');
var fs = require('fs');

var ConfigManager = dejavu.Class.declare({
	$name: 'ConfigManager',

	__defaultConfig: null,
	__userConfig: null,
	__mergedConfig: null,

	__$logger: null,

	initialize: function($loggerService) {
		this.__resetConfiguration();
		this.__$loggerService = $loggerService;
	},

	loadFromFile: function(configFile) {
		try {
			var configFileContents = fs.readFileSync(configFile);
			this.__userConfig = JSON.parse(configFileContents);
			this.__mergedConfig = this.__mergeConfigs(this.__defaultConfig, this.__userConfig);
			this.__$loggerService.info('Loaded configuration file: ' + configFile);
		} catch(err) {
			this.__$loggerService.error('Could not load configuration file: ' + configFile);
			this.__$loggerService.error(err.toString());
			process.exit(1);
		}
	},

	__resetConfiguration: function() {
		this.__defaultConfig = {
			peerTimeout: 60,
			trackerPort: 3000,
			webguiPort: 4000,

			persistentShares: []
		};
		this.__userConfig = {};
		this.__mergedConfig = this.__mergeConfigs(this.__defaultConfig, this.__userConfig);
	},

	__mergeConfigs: function(configA, configB) {
		var mergedConfig = {};
		for(var key in configA) mergedConfig[key] = configA[key];
		for(var key in configB) mergedConfig[key] = configB[key];
		return mergedConfig;
	}
});

module.exports = ConfigManager;