'use strict';
var dejavu = require('dejavu');
var bencoding = require('bencoding');
var Helpers = require('../util/Helpers');

var TcpTrackerPeer = dejavu.Class.declare({
	$name: 'TcpTrackerPeer',

	__peer: null,
	__packetBuffer: null,
	__currentBytes: null,
	__expectedBytes: null,
	__logPrefix: null,

	__$loggerService: null,

	initialize: function(peer, $loggerService, $eventSystem) {
		this.__peer = peer;
		this.__$loggerService = $loggerService;
		this.__$eventSystem = $eventSystem;
		this.__peer.on('data', this.__onData);
		this.__onConnect();
	},

	__onConnect: function() {
		this.__logPrefix = '[' + this.__peer.remoteAddress + ':' + this.__peer.remotePort + '] ';
		this.__$loggerService.info('New TcpTrackerPeer: ' + this.__peer.remoteAddress);
	}.$bound(),

	__onData: function(data) {
		if(this.__expectedBytes)
			this.__$loggerService.silly(this.__logPrefix + 'Current bytes: ' + this.__currentBytes + ', Expected bytes: ' + this.__expectedBytes);
		if(!this.__expectedBytes) {
			if(data.length < 4) {
				this.__$loggerService.warn(this.__logPrefix + 'Expected 4 byte packet size, got ' + data.length + ' bytes');
				this.__$loggerService.warn(this.__logPrefix + 'Packet will be discarded.');
				return;
			}
			if(data.length == 4) return;
			this.__currentBytes = 0;
			this.__expectedBytes = data.readUInt32BE();
			this.__packetBuffer = [];
			this.__onData(data.slice(4));
		} else {
			if(this.__currentBytes + data.length >= this.__expectedBytes) {
				this.__packetBuffer.push(data.slice(0, this.__expectedBytes - this.__currentBytes));
				this.__processPacket(Buffer.concat(this.__packetBuffer));
				var remainingData = data.slice(this.__expectedBytes - this.__currentBytes);
				this.__currentBytes = this.__expectedBytes = this.__packetBuffer = null;
				if(remainingData.length > 0) this.__onData(remainingData);
			} else {
				this.__currentBytes += data.length;
				this.__packetBuffer.push(data);
			}
		}
	}.$bound(),

	__processPacket: function(rawPacket) {
		// Try to decode packet with bencode
		var packet = bencoding.decode(rawPacket);
		if(packet.toJSON === undefined) {
			this.__$loggerService.warn(this.__logPrefix + 'Discarded packet which could not be decoded.');
			return;
		}
		packet = packet.toJSON();

		// Handle packet based on its type or discard if invalid
		var packetType = packet.hasOwnProperty('m') ? packet.m.toString() : null;
		switch(packetType) {
			case 'get_peers': this.__onGetPeers(packet); break;
			default:
				this.__$loggerService.warn(this.__logPrefix + 'Discarded packet with invalid type: ' + packetType);
		}
	},

	__onGetPeers: function(packet) {
		var shareId = packet.share.toString('hex');
		var peerId = packet.peer.toString('hex');
		var localAddress = Helpers.ip_ntoa(packet.la.readUInt32BE());
		var localPort = packet.lp;

		this.__$loggerService.verbose(this.__logPrefix + 'Trying to announce share: ' + shareId);
		this.__$loggerService.verbose(this.__logPrefix + '> Peer ID: ' + peerId);
		this.__$loggerService.verbose(this.__logPrefix + '> Local connection: ' + localAddress + ':' + localPort);
		this.__$eventSystem.emit('btsync.handle_peer_announcement', {
			shareId: shareId, peerId: peerId,
			localAddress: localAddress, localPort: localPort,
			remoteAddress: this.__peer.remoteAddress, remotePort: this.__peer.remotePort
		}, this.__peer);
	}
});

module.exports = TcpTrackerPeer;