'use strict';
var dejavu = require('dejavu');
var Helpers = require('../../util/Helpers');

var Announcement = dejavu.Class.declare({
	$name: 'Announcement',

	/* Private variables */
	__shareId: null,
	__peerId: null,
	__createdAt: null,
	__updatedAt: null,

	/**
	 * Initializes a new announcement for the given peer and share ID.
	 * Only one instance should exist per peer and share pair, otherwise
	 * bad things might happen. You are responsible for managing these
	 * instances, as this class doesn't have any possibility to manage that.
	 *
	 * @constructor
	 * @param  {string} shareId Hex-encoded share ID
	 * @param  {string} peerId Hex-encoded peer ID
	 */
	initialize: function(shareId, peerId) {
		this.__shareId = shareId;
		this.__peerId = peerId;
		this.__createdAt = Helpers.timestamp();
		this.__updatedAt = this.__createdAt;
	},

	/**
	 * Renews the announcement by setting 'updatedAt' to the current time.
	 * This will keep that announcement alive, as the client announces the
	 * share every few minutes.
	 */
	renew: function() {
		this.__updatedAt = Helpers.timestamp();
	},

	/**
	 * This does not immediately destroy the announcement. It just sets the
	 * updatedAt time to zero, so that it will get wiped as soon as the Sync.IO
	 * Garbage Collector starts doing his work. If a peer should announce
	 * that share again before the GC runs, it won't be destroyed.
	 */
	destroy: function() {
		this.__updatedAt = 0;
	},

	/* Dumb getters */
	getPeer: function() { return this.__peerId; },
	getShare: function() { return this.__shareId; },

	/**
	 * For logging purposes, every model should have its own toString() method
	 * which represents a nice and colorful string. Isn't that wonderful?
	 * 
	 * @return {string} Object description string
	 */
	toString: function() {
		return [
			'Announcement'.bold,
			'['.bold.red,
			Helpers.shortenId(this.__peerId).grey,
			'@'.bold.red,
			Helpers.shortenId(this.__shareId).grey,
			']'.bold.red
		].join('');
	}
});

module.exports = Announcement;