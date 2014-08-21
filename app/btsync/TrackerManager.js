'use strict';
var dejavu = require('dejavu');

var TrackerManager = dejavu.Class.declare({
	$name: 'TrackerManager',

	__shares: {},
	__peers: {},

	__$loggerService: null,
	__$eventSystem: null,

	initialize: function($loggerService, $eventSystem) {
		this.__$loggerService = $loggerService;
		this.__$eventSystem = $eventSystem;
		this.__registerEvents();
	},

	__registerEvents: function() {
		this.__$eventSystem.on('btsync.handle_peer_announcement', this.__onHandlePeerAnnouncement);
		this.__$eventSystem.on('btsync.add_peer', this.__onAddPeer);
		this.__$eventSystem.on('btsync.update_peer', this.__onUpdatePeer);
		this.__$eventSystem.on('btsync.add_share', this.__onAddShare);
		this.__$eventSystem.on('btsync.update_share_peers', this.__onUpdateSharePeers);
	},

	__onHandlePeerAnnouncement: function __onHandlePeerAnnouncement(peerData, peerSocket, cb) {
		var retriggerEvent = function() {
			this.__onHandlePeerAnnouncement(peerData, cb);
		}.$bind(this);

		// If peer doesn't exist it, create and retrigger event
		if(!this.__peers.hasOwnProperty(peerData.peerId)) {
			this.__$eventSystem.emit('btsync.add_peer', {
				id: peerData.peerId,
				socket: peerSocket
			}, retriggerEvent);
			return;
		}

		// If share doesn't exist it, create and retrigger event
		if(!this.__shares.hasOwnProperty(peerData.shareId)) {
			this.__$eventSystem.emit('btsync.add_share', {
				id: peerData.shareId
			}, retriggerEvent);
			return;
		}

		// Update peer statistics
		this.__$eventSystem.emit('btsync.update_peer', {
			id: peerData.peerId,
			local: [peerData.localAddress, peerData.localPort],
			remote: [peerData.remoteAddress, peerData.remotePort]
		});

		// Update peer list of share
		this.__$eventSystem.emit('btsync.update_share_peers', {
			id: peerData.shareId,
			peer: this.__peers[peerData.peerId]
		});
	}.$bound(),

	__onAddPeer: function __onAddPeer(data, cb) {
		// Add a new peer
		this.__$loggerService.verbose('Created new Peer[' + data.id + ']');
		this.__peers[data.id] = {
			id: data.id,
			socket: data.socket,
			createdAt: (new Date()).getTime(),
			updatedAt: (new Date()).getTime(),
			local: [null, null],
			remote: [null, null]
		};

		// Execute callback if provided
		if(cb) return cb();
	}.$bound(),

	__onUpdatePeer: function __onUpdatePeer(data, cb) {
		// Check if peer with given ID exists
		if(!this.__peers.hasOwnProperty(data.id)) {
			throw new Error('Failed to update peer with inexistant ID: ' + data.id);
		}

		// Update peer data
		this.__$loggerService.silly('Updated Peer[' + data.id + ']');
		this.__peers[data.id].updatedAt = (new Date()).getTime()
		this.__peers[data.id].local = data.local;
		this.__peers[data.id].remote = data.remote;

		// Execute callback if provided
		if(cb) return cb();
	}.$bound(),

	__onAddShare: function __onAddShare(data, cb) {
		// Add a new share
		this.__$loggerService.verbose('Created new Share[' + data.id + ']');
		this.__shares[data.id] = {
			id: data.id,
			createdAt: (new Date()).getTime(),
			updatedAt: (new Date()).getTime(),
			peers: {}
		};

		// Execute callback if provided
		if(cb) return cb();
	}.$bound(),

	__onUpdateSharePeers: function __onUpdateSharePeers(data, cb) {
		// Check if share with given ID exists
		if(!this.__shares.hasOwnProperty(data.id)) {
			throw new Error('Failed to update peers of share with inexistant ID: ' + data.id);
		}

		// Check if peer with given ID exists
		if(!this.__peers.hasOwnProperty(data.peer.id)) {
			throw new Error('Failed to update peers of share with inexistant peer ID: ' + data.peerId);
		}

		// Did that peer already announce that share?
		var peerList = this.__shares[data.id].peers;
		if(peerList.hasOwnProperty(data.peer.id)) {
			// Already announced before, just update the time
			this.__$loggerService.silly('Renewed linkage from Peer[' + data.peer.id + '] to Share[' + data.peer.id + ']');
			peerList[data.peer.id].updatedAt = (new Date()).getTime();
		} else {
			// Not announced before, add the peer to the share
			this.__$loggerService.verbose('Linked Peer[' + data.peer.id + '] to Share[' + data.id + ']');

			peerList[data.peer.id] = {
				id: data.peer.id,
				peer: data.peer,
				createdAt: (new Date()).getTime(),
				updatedAt: (new Date()).getTime()
			};
		}

		// Execute callback if provided
		if(cb) return cb();
	}.$bound()
});

module.exports = TrackerManager;