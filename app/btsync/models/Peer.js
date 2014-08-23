'use strict';
var dejavu = require('dejavu');
var Helpers = require('../../util/Helpers');

var Peer = dejavu.Class.declare({
	$name: 'Peer',

	/* Private variables */
	__id: null,
	__socket: null,
	__local: [null, null],
	__remote: [null, null],
	__createdAt: null,
	__updatedAt: null,

	/**
	 * Initializes a new peer with the given ID. That ID should be unique
	 * and only one instance should exist per ID, although this class doesn't
	 * have any ability to check that! So keep that in mind when constructing
	 * new Peer instances.
	 *
	 * @constructor
	 * @param  {[type]} id Hex-encoded peer ID
	 */
	initialize: function(id) {
		this.__id = id;
		this.__createdAt = Helpers.timestamp();
		this.__updatedAt = this.__createdAt;
	},

	/* Dumb getters */
	getSocket: function() { return this.__socket; },
	getLocalInterface: function() { return this.__local; },
	getRemoteInterface: function() { return this.__remote; },

	/* Dumb setters */
	setSocket: function(socket) { this.__updated(); this.__socket = socket; },
	setLocalInterface: function(address, port) { this.__updated(); this.__local = [address, port]; },
	setRemoteInterface: function(address, port) { this.__updated(); this.__remote = [address, port]; },

	/**
	 * For logging purposes, every model should have its own toString() method
	 * which represents a nice and colorful string. Isn't that wonderful?
	 * 
	 * @return {string} Object description string
	 */
	toString: function() {
		return [
			'Peer'.bold,
			'<'.green,
			this.__local[0] ? this.__local[0].toString() : '???',
			'/'.green,
			this.__remote[0] ? this.__remote[0].toString() : '???',
			'>'.green,
			'['.bold.red,
			Helpers.shortenId(this.__id).grey,
			']'.bold.red
		].join('');
	},

	/* This short method will set the updatedAt property to the current timestamp */
	__updated: function() { this.__updatedAt = Helpers.timestamp(); }
});

module.exports = Peer;