'use strict';
var dejavu = require('dejavu');
var fs = require('fs');

var ConfigManager = dejavu.Class.declare({
	$name: 'ConfigManager',

	__defaultConfig: null,
	__userConfig: null,
	__mergedConfig: null,

	__$loggerService: null,

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
			this.__$loggerService.error('The application will exit now.');
			process.exit(1);
		}
	},

	get: function(configKey, defaultValue) {
		if(!this.__mergedConfig.hasOwnProperty(configKey)) {
			this.__$loggerService.error('Application requested inexistant configuration key: ' + configKey);
			this.__$loggerService.error('This should not happen. Did you mess with the default config?');
			this.__$loggerService.error('The application will exit now.');
			process.exit(2);
		}
		return this.__mergedConfig[configKey];
	},

	__resetConfiguration: function() {
		this.__defaultConfig = {
			peerTimeout: 60,
			serveConfig: true,
			serveTracker: true,
			serveWeb: true,

			configPort: 80,
			trackerPort: 3000,
			webPort: 4000,

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