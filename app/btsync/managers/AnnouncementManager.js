'use strict';
var dejavu = require('dejavu');
var bencoding = require('bencoding');
var Announcement = require('../models/Announcement');

var AnnouncementManager = dejavu.Class.declare({
	$name: 'AnnouncementManager',

	/* Private variables */
	__announcements: {},

	/* Module instances */
	__$loggerService: null,
	__$eventSystem: null,
	__$peerManager: null,
	__$shareManager: null,

	initialize: function($loggerService, $eventSystem, $peerManager, $shareManager) {
		this.__$loggerService = $loggerService;
		this.__$eventSystem = $eventSystem;
		this.__$peerManager = $peerManager;
		this.__$shareManager = $shareManager;
		this.__registerEvents();
	},

	__registerEvents: function() {
		this.__$eventSystem.on('btsync.peer_announcement', this.__onPeerAnnouncement);
		this.__$eventSystem.on('syncio.distribute_peers', this.__onDistributePeers);
	},

	__onPeerAnnouncement: function(socket, data) {
		var combinedKey = data.shareId + '/' + data.peerId;
		if(!this.__announcements.hasOwnProperty(data.shareId) || !this.__announcements[data.shareId].hasOwnProperty(data.peerId)) {
			if(!this.__announcements.hasOwnProperty(data.shareId)) {
				this.__announcements[data.shareId] = {};
			}

			var announcement = this.__announcements[data.shareId][data.peerId] = new Announcement(data.shareId, data.peerId);
			this.__$loggerService.verbose('Created new ' + announcement.toString());
		} else {
			var announcement = this.__announcements[data.shareId][data.peerId];
			announcement.renew();
			this.__$loggerService.verbose('Renewed ' + announcement.toString());
		}

		this.__$eventSystem.emit('syncio.distribute_peers', data.shareId);
	}.$bound(),

	__onDistributePeers: function(shareId) {
		if(!this.__announcements.hasOwnProperty(shareId)) {
			this.__$loggerService.warn('Can not distribute peer list for inexistant share with ID: ' + shareId);
			return;
		}

		// Build peer list packet
		var packet = {
			ea: null,
			m: 'peers',
			peers: this.__buildPeerList(shareId),
			share: new Buffer(shareId, 'hex'),
			time: Math.floor((new Date()).getTime() / 1000)
		};

		// Distribute peer list to all peers
		for(var peerId in this.__announcements[shareId]) {
			var peer = this.__$peerManager.getPeer(peerId);
			if(!peer) {
				this.__$loggerService.warn('Found announcement with inexistant peer ID: ' + peerId);
				this.__$loggerService.warn('This really should NOT happen. Please report that issue.');
				continue;
			}

			packet.ea = peer.getRemoteInterfaceBin();
			peer.send(bencoding.encode(packet), (function(peer) {
				return function() {
					this.__$loggerService.silly('Successfully sent peer list to ' + peer.toString());
				}.$bind(this);
			}.$bind(this))(peer));
		}

		var share = this.__$shareManager.getShare(shareId);
		if(share) {
			this.__$loggerService.verbose('Distributed peer list for ' + share.toString());
		} else {
			this.__$loggerService.verbose('Distributed peer list for yet unknown share ID: ' + shareId);
		}
	}.$bound(),

	__buildPeerList: function(shareId) {
		var peerList = [];

		for(var peerId in this.__announcements[shareId]) {
			var peer = this.__$peerManager.getPeer(peerId);
			if(!peer) {
				this.__$loggerService.warn('Found announcement with inexistant peer ID: ' + peerId);
				this.__$loggerService.warn('This really should NOT happen. Please report that issue.');
				continue;
			}

			peerList.push({
				a: peer.getRemoteInterfaceBin(),
				la: peer.getLocalInterfaceBin(),
				p: new Buffer(peerId, 'hex')
			});
		}

		return peerList;
	}
});

module.exports = AnnouncementManager;