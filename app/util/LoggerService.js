'use strict';
var dejavu = require('dejavu');
var winston = require('winston');

var LoggerService = dejavu.Class.declare({
	$name: 'LoggerService',

	__winston: null,

	initialize: function() {
		this.__winston = new winston.Logger();
		this.__setupTransports();
		this.__printWelcomeMessage();
	},

	__setupTransports: function() {
		this.__winston.add(winston.transports.Console, {
			colorize: true,
			timestamps: true
		});
	},

	__printWelcomeMessage: function() {
		this.__winston.info('==================== sync.io ========================');
		this.__winston.info('| Made by: Pascal Mathis <dev@snapserv.net>         |');
		this.__winston.info('|                                                   |');
		this.__winston.info('| This application is unofficial and not affiliated |');
		this.__winston.info('| or related to BitTorrent, Inc.                    |');
		this.__winston.info('=====================================================');
	},

	/* Wrappers around winston */
	info: function() { this.__winston.info.apply(this.__winston, arguments); },
	warn: function() { this.__winston.warn.apply(this.__winston, arguments); },
	error: function() { this.__winston.error.apply(this.__winston, arguments); }
});

module.exports = LoggerService;