
var knox = require('knox')
  , mime = require('mime')
  , Store = require('../store');

exports = module.exports = S3;

function S3 (options) {
  this.s3 = knox.createClient({
      key: options.key
    , secret: options.secret
    , bucket: options.bucket
  });
  Store.call(this, options);
}

S3.prototype.__proto__ = Store.prototype;

/* get a writable stream */

S3.prototype.stream = function (path, length) {
  var failed = false
    , s3 = this.s3;
  
  var put = this.s3.put(path, {
      'Content-Length': length
    , 'Content-Type': mime.lookup(path)
  });

  put.on('error', function (err) {
    failed = true;
  });
  
  put.on('response', function (res) {
    if (res.statusCode === 200 && !failed) {
      put.emit('done', s3.https(path));
    } else {
      put.emit('error', new Error('wrong status code from s3: ' + res.statusCode));
    }
  });

  return put;

};
