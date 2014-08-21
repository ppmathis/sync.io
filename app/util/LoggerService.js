'use strict';
var dejavu = require('dejavu');
var winston = require('winston');

var LoggerService = dejavu.Class.declare({
	$name: 'LoggerService',

	/* Private variables */
	__winston: null,

	/**
	 * Initializes a new LoggerService instance. This function
	 * will setup a new Winston instance, add some transports
	 * and then print the welcome message. There's no way to
	 * suppress the welcome message, so this instance should
	 * be shared across the application.
	 * 
	 * @constructor
	 */
	initialize: function() {
		this.__winston = new winston.Logger();
		this.__setupTransports();
		this.__printWelcomeMessage();
	},

	/**
	 * As Winston is based on user-configurable transports,
	 * this method adds a basic console logger to Winston.
	 * It will also enable the CLI mode of Winston, to improve
	 * the output of big data.
	 * 
	 * @private
	 */
	__setupTransports: function() {
		this.__winston.add(winston.transports.Console, {
			colorize: true,
			timestamp: true,
			level: 'silly'
		});
		this.__winston.cli();
	},

	/**
	 * This method prints the Sync.IO welcome message. You're
	 * not allowed to modify or remove this function at all.
	 * Please show some respect to the author - thanks!
	 */
	__printWelcomeMessage: function() {
		this.__winston.info('==================== sync.io ========================');
		this.__winston.info('| Made by: Pascal Mathis <dev@snapserv.net>         |');
		this.__winston.info('|                                                   |');
		this.__winston.info('| This application is unofficial and not affiliated |');
		this.__winston.info('| or related to BitTorrent, Inc.                    |');
		this.__winston.info('=====================================================');
	},

	/* Wrappers around winston */
	silly: function() { this.__winston.silly.apply(this.__winston, arguments); },
	debug: function() { this.__winston.debug.apply(this.__winston, arguments); },
	verbose: function() { this.__winston.verbose.apply(this.__winston, arguments); },
	data: function() { this.__winston.data.apply(this.__winston, arguments); },
	info: function() { this.__winston.info.apply(this.__winston, arguments); },
	warn: function() { this.__winston.warn.apply(this.__winston, arguments); },
	error: function() { this.__winston.error.apply(this.__winston, arguments); }
});

module.exports = LoggerService;