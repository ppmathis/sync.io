'use strict';
var dejavu = require('dejavu');
var TcpTrackerServer = require('./TcpTrackerServer');
var UdpTrackerServer = require('./UdpTrackerServer');

var TrackerServer = dejavu.Class.declare({
	$name: 'TrackerServer',

	__tcpServer: null,
	__udpServer: null,

	initialize: function($loggerService) {
		this.__tcpServer = new TcpTrackerServer($loggerService);
		this.__udpServer = new UdpTrackerServer($loggerService);
	},

	listen: function(port) {
		this.__tcpServer.listen(port);
		this.__udpServer.listen(port);
	}
});

module.exports = TrackerServer;