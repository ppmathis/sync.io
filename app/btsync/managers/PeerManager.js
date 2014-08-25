'use strict';
var dejavu = require('dejavu');
var Peer = require('../models/Peer');

var PeerManager = dejavu.Class.declare({
	$name: 'PeerManager',

	/* Private variables */
	__peers: {},

	/* Module instances */
	__$loggerService: null,
	__$eventSystem: null,

	initialize: function($loggerService, $eventSystem) {
		this.__$loggerService = $loggerService;
		this.__$eventSystem = $eventSystem;
		this.__registerEvents();
	},

	getPeer: function(peerId) {
		for(var key in this.__peers) {
			if(peerId === key) return this.__peers[key];
		}
		return null;
	},

	__registerEvents: function() {
		this.__$eventSystem.on('btsync.peer_announcement', this.__onPeerAnnouncement);
	},

	__onPeerAnnouncement: function(socket, data) {
		if(!this.__peers.hasOwnProperty(data.peerId)) {
			var peer = this.__peers[data.peerId] = new Peer(data.peerId);
			this.__$loggerService.info('Created new ' + peer.toString());
		} else {
			var peer = this.__peers[data.peerId];
		}

		peer.setSocket(socket);
		peer.setLocalInterface(data.localAddress, data.localPort);
		peer.setRemoteInterface(data.remoteAddress, data.remotePort);
		this.__$loggerService.silly('Updated data for ' + peer.toString());
	}.$bound()
});

module.exports = PeerManager;