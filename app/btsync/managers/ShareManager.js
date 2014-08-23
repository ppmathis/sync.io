'use strict';
var dejavu = require('dejavu');
var Share = require('../models/Share');

var ShareManager = dejavu.Class.declare({
	$name: 'ShareManager',

	/* Private variables */
	__shares: {},

	/* Module instances */
	__$loggerService: null,
	__$eventSystem: null,

	initialize: function($loggerService, $eventSystem) {
		this.__$loggerService = $loggerService;
		this.__$eventSystem = $eventSystem;
		this.__registerEvents();
	},

	__registerEvents: function() {
		this.__$eventSystem.on('btsync.peer_announcement', this.__onPeerAnnouncement);
	},

	__onPeerAnnouncement: function(socket, data) {
		if(!this.__shares.hasOwnProperty(data.shareId)) {
			var share = this.__shares[data.shareId] = new Share(data.shareId);
			this.__$loggerService.info('Created new ' + share.toString());
		} else {
			var share = this.__shares[data.shareId];
		}
	}.$bound()
});

module.exports = ShareManager;