'use strict';
var dejavu = require('dejavu');
var net = require('net');
var TcpTrackerPeer = require('./TcpTrackerPeer');

var TcpTrackerServer = dejavu.Class.declare({
	$name: 'TcpTrackerServer',

	__socket: null,

	__$loggerService: null,

	initialize: function($loggerService) {
		this.__socket = net.createServer();
		this.__$loggerService = $loggerService;
	},

	listen: function(port) {
		this.__socket.on('listening', function() {
			this.__$loggerService.info('TcpTrackerServer started listening on port ' + port);
		}.$bind(this));
		this.__socket.on('connection', this.__onSocketConnection);
		this.__socket.on('error', this.__onSocketError);

		this.__socket.listen(port);
	},

	__onSocketConnection: function(peer) {
		new TcpTrackerPeer(peer, this.__$loggerService);
	}.$bound(),

	__onSocketError: function(err) {
		this.__$loggerService.error('TcpTrackerServer occured a fatal socket error on port ' + port);
		this.__$loggerService.error(err.toString());
		this.__$loggerService.error('The application will exit now.');
		process.exit(4);
	}.$bound()
});

module.exports = TcpTrackerServer;