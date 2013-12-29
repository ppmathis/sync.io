# sync.io
#
# Created by Pascal Mathis at 12/29/13
# License: GPLv3 (Please see LICENSE for more information)

path = require('path')
SyncIO = require('./lib/SyncIO')

app = new SyncIO(path.join(__dirname, '../config.json'))
app.run()