'use strict';
var dejavu = require('dejavu');
var fs = require('fs');

var ConfigManager = dejavu.Class.declare({
	$name: 'ConfigManager',

	/* Private variables */
	__defaultConfig: null,
	__userConfig: null,
	__mergedConfig: null,

	/* Module instances */
	__$loggerService: null,

	/**
	 * Initializes a new ConfigManager instance. Remember to load
	 * a configuration file before using this instance, as otherwise
	 * it will be pretty useless.
	 *
	 * @constructor
	 * @param  {LoggerService} $loggerService
	 */
	initialize: function($loggerService) {
		this.__$loggerService = $loggerService;

		this.__resetConfiguration();
	},

	/**
	 * Loads a configuration file at the provided path. If that operation
	 * should fail, it will spit out an error and exit the application
	 * with the exit code 1. You can actually call this function multiple
	 * times, as the different configurations get merged together.
	 * 
	 * @param  {string} configFile Path to configuration file
	 */
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

	/**
	 * Gets the provided configuration key. If it should not exist,
	 * an error will be logged and the application with exit with
	 * the exit code 2.
	 * 
	 * @param  {string} configKey Name of the configuration key
	 */
	get: function(configKey) {
		if(!this.__mergedConfig.hasOwnProperty(configKey)) {
			this.__$loggerService.error('Application requested inexistant configuration key: ' + configKey);
			this.__$loggerService.error('This should not happen. Did you mess with the default config?');
			this.__$loggerService.error('The application will exit now.');
			process.exit(2);
		}
		return this.__mergedConfig[configKey];
	},

	/**
	 * Resets the configuration completely. At the current moment,
	 * this method also provides a default configuration. It is planned
	 * to split that into a separate file at a latter point.
	 *
	 * @private
	 */
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

	/**
	 * Merges the configuration object B with the configuration
	 * object A. Object B has precedence, no nesting supported.
	 * 
	 * @param  {object} configA Configuration A
	 * @param  {object} configB Configuration B
	 * @return {object} Merged configuration
	 */
	__mergeConfigs: function(configA, configB) {
		var mergedConfig = {};
		for(var key in configA) mergedConfig[key] = configA[key];
		for(var key in configB) mergedConfig[key] = configB[key];
		return mergedConfig;
	}
});

module.exports = ConfigManager;