'use strict';
var dejavu = require('dejavu');
var Announcement = require('../models/Announcement');

var AnnouncementManager = dejavu.Class.declare({
	$name: 'AnnouncementManager',

	/* Private variables */
	__announcements: {},

	/* Module instances */
	__$loggerService: null,
	__$eventSystem: null,

	initialize: function($loggerService, $eventSystem) {
		this.__$loggerService = $loggerService;
		this.__$eventSystem = $eventSystem;
		this.__registerEvents();
	},

	__registerEvents: function() {
		this.__$eventSystem.on('btsync.peer_announcement', this.__onPeerAnnouncement);
	},

	__onPeerAnnouncement: function(socket, data) {
		var combinedKey = data.shareId + '/' + data.peerId;
		if(!this.__announcements.hasOwnProperty(combinedKey)) {
			var announcement = this.__announcements[combinedKey] = new Announcement(data.shareId, data.peerId);
			this.__$loggerService.verbose('Created new ' + announcement.toString());
		} else {
			var announcement = this.__announcements[combinedKey];
			announcement.renew();
			this.__$loggerService.debug('Renewed ' + announcement.toString());
		}
	}.$bound()
});

module.exports = AnnouncementManager;