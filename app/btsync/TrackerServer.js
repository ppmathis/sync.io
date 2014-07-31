'use strict';
var dejavu = require('dejavu');
var dgram = require('dgram');

var TrackerServer = dejavu.Class.declare({
	$name: 'TrackerServer',

	__socket: null,

	__$loggerService: null,

	initialize: function($loggerService) {
		this.__socket = dgram.createSocket('udp4');
		this.__$loggerService = $loggerService;
	},

	listen: function(port) {
		this.__socket.on('listening', function() {
			this.__$loggerService.info('TrackerServer started listening on port ' + port);
		}.$bind(this));

		this.__socket.on('error', this.__onSocketError);
		this.__socket.on('message', this.__onSocketMessage);

		this.__socket.bind(port);
	},

	__onSocketMessage: function(packet, peer) {
		console.log(require('util').inspect(packet));
	}.$bound(),

	__onSocketError: function(err) {
		this.__$loggerService.error('TrackerServer occured a fatal socket error on port ' + port);
		this.__$loggerService.error(err.toString());
		this.__$loggerService.error('The application will exit now.');
		process.exit(4);
	}.$bound()
});

module.exports = TrackerServer;