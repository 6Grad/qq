/* Middleware */

var fs = require('fs');

var Mw = module.exports = function (options) {

  if(!options.store) throw new Error('please specify a Store');

  this.store = options.store;

  var that = this;

  return function (req, res, next) {
    if (req.xhr) {
      that.xhr(req, res, next);
    } else {
      that.form(req, res, next);
    }
  };

};

Mw.prototype.xhr = function (req, res, next) {

  var store = this.store;

  var path = store.path(req.header('x-file-name'), req);

  var s = store.stream(path, req.header('content-length'));

  s.on('error', function (err) {
    res.json({success: false, error: err.message});
  });

  s.on('done', function (url) {
    res.json({success: true, url: url + '?' + Date.now() });
  });

  req
    .on('data', function (chunk) { s.write(chunk); })
    .on('end', function () {
      s.end();
    });
};

/*
 * Make sure to use connect.bodyParser() before
 */

Mw.prototype.form = function (req, res, next) {
  
  var store = this.store;

  if (!(req.files && req.files.qqfile)) return res.json({success: false, error: 'no qqfile'});
  
  var qqfile = req.files.qqfile;
  var path = store.path(qqfile.name, req);

  fs.readFile(qqfile.path, function(err, buf) {
    if (err) return res.send(JSON.stringify({success:false, error: err.message}));
    if (!buf.length) return res.json(JSON.stringify({success: false, error: 'empty file'}));

    var s = store.stream(path, buf.length);
    
    s.on('error', function (err) {
      res.send(JSON.stringify({success: false, error: err.message}));
    });

    s.on('done', function (url) {
      //content-type applicatin/json (req.json(..)) is not handled properly by ie8
      //therefore send as text/plain
      res.send(JSON.stringify({success: true, url: url + '?' + Date.now() }));
    });

    s.end(buf);

  });

};
