'use strict';
var SyncIO = require('../app/SyncIO');
var path = require('path');

var app = new SyncIO();
var configurationFile = path.join(__dirname, 'config.json');
app.run(configurationFile);