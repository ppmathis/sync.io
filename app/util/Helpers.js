'use strict';
var dejavu = require('dejavu');

var Helpers = dejavu.Class.declare({
	$name: 'Helpers',
	$statics: {
		ip_ntoa: function(numericIp) {
			return [
				((numericIp >> 24) & 0xFF),
				((numericIp >> 16) & 0xFF),
				((numericIp >>  8) & 0xFF),
				((numericIp >>  0) & 0xFF)
			].join('.');
		}
	}
});

module.exports = Helpers;