'use strict';
var dejavu = require('dejavu');
var Helpers = require('../../util/Helpers');

var Share = dejavu.Class.declare({
	$name: 'Share',

	/* Private variables */
	__id: null,
	__announcements: [],

	/**
	 * Initializes a new share with the given ID. That ID should be unique
	 * and only one instance should exist per ID, although this class doesn't
	 * have any ability to check that! So keep that in mind when constructing
	 * new Share instances.
	 *
	 * @constructor
	 * @param  {string} id Hex-encoded share ID
	 */
	initialize: function(id) {
		this.__id = id;
	},

	/**
	 * For logging purposes, every model should have its own toString() method
	 * which represents a nice and colorful string. Isn't that wonderful?
	 * 
	 * @return {string} Object description string
	 */
	toString: function() {
		return [
			'Share'.bold,
			'['.bold.red,
			Helpers.shortenId(this.__id).grey,
			']'.bold.red
		].join('');
	}
});

module.exports = Share;