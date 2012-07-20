
var Mw = require('./mw');

exports.mw = function (options) {
  return new Mw(options);
};

exports.stores = require('./stores/');
