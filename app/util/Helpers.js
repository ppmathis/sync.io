'use strict';
var dejavu = require('dejavu');

var Helpers = dejavu.Class.declare({
	$name: 'Helpers',
	$statics: {
		/**
		 * Converts a 4 byte IP into the string representation. This will obviously
		 * only work with IPv4, but BTSync does not support IPv6 at the moment anyways,
		 * so that should be fine.
		 * 
		 * @param  {number} numericIp Numeric 4 byte representation of an IP
		 * @return {string} String representation of the given IP
		 */
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