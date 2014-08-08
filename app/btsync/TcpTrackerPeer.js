'use strict';
var dejavu = require('dejavu');
var bencoding = require('bencoding');

var TcpTrackerPeer = dejavu.Class.declare({
	$name: 'TcpTrackerPeer',

	__peer: null,
	__packetBuffer: null,
	__currentBytes: null,
	__expectedBytes: null,
	__logPrefix: null,

	__$loggerService: null,

	initialize: function(peer, $loggerService) {
		this.__peer = peer;
		this.__$loggerService = $loggerService;
		this.__peer.on('data', this.__onData);
		this.__onConnect();
	},

	__onConnect: function() {
		this.__logPrefix = '[' + this.__peer.remoteAddress + '] ';
		this.__$loggerService.info('New TcpTrackerPeer: ' + this.__peer.remoteAddress);
	}.$bound(),

	__onData: function(data) {
		if(this.__expectedBytes)
			this.__$loggerService.info(this.__logPrefix + 'Current: ' + this.__currentBytes + ', Expected: ' + this.__expectedBytes);
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

		// Check if packet has a valid type
		var packetType = packet.hasOwnProperty('m') ? packet.m.toString() : null;
		console.log(packetType);
	}
});

module.exports = TcpTrackerPeer;