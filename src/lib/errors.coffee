# sync.io
#
# Created by Pascal Mathis at 12/29/13
# License: GPLv3 (Please see LICENSE for more information)

util = require('util')

# A list of error classes which should be generated
errorClasses = [
  'ConfigurationError'
]

# SIOError is the base class for all other errors from sync.io
SIOError = (msg, constr) ->
  Error.captureStackTrace(this, constr || this)
  this.message = msg || 'Error'
util.inherits(SIOError, Error)
SIOError::name = 'SIOError'

# Generate error classes based on SIOError
((errorName) ->
  errorFn = exports[errorName] = (msg) ->
    errorFn.super_.call(this, msg, this.constructor)
  util.inherits(errorFn, SIOError)
  errorFn::name = errorName
)(errorName) for errorName in errorClasses