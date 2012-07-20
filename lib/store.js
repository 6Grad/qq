
var EventEmitter = require('event').EventEmitter;

exports = module.exports = Store;

function Store (options) {
  this.options = options;
}

Store.prototype.__proto__ = EventEmitter.prototype;

Store.prototype.path = function (fn, req) {
  var cb = this.options.path;
  if (typeof cb === 'function') {
    return cb(fn, req); 
  } else {
    return '/' + fn;
  }
}

Store.prototype.stream = function (path, options) {}
