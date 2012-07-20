
var knox = require('knox')
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
  var failed = false;
  var put = this.s3.put(this.path, {
      'Content-Length': length
    , 'Content-Type': 'application/octet-stream'
  });

  put.on('error', function (err) {
    failed = true;
    this.emit('error', err);
  });
  
  put.on('response', function (res) {
    if (res.statusCode === 200 && !failed) {
      this.emit('done', this.s3.https(this.path));
    } else {
      this.emit('error', new Error('wrong status code from s3 ' + res.statusCode));
    }
  });

  return put; 

}
