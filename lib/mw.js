/* Middleware */

var connect = require('connect');

Mw = function (options) {

  if(!options.store) throw new Error('please specify a Store');  

  this.store = options.store;
  this.path = options.path || '/qq.upload';
  
  var that = this;

  return function (req, res, next) {
    if (req.path !== that.path) return next(); //not for us
    req.on('error', function (err){
      next(err);
    });
    if (err) return next(err);
    if (req.xhr()) {
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

  store.on('error', function (err) {
    console.error('error: ' + err);
    res.json({success: false});
  });

  store.on('done', function (url) {
    res.json({success: true, url: url + '?' + Date.now() });
  });

  req
    .on('error', function (err){  next(err); })
    .on('data', function (chunk) { s.write(chunk); })
    .on('end', function () {
      s.end();
    });
};

Mw.prototype.form = function (req, res, next) {
  
  var bodyParser = connect.bodyParser();

  bodyParser(req, res, function (err) {
    if (err) return res.json({success: false, error: err.message});
    if (!(req.files && req.files.qqfile)) return res.json({success: false, error: 'no qqfile'});
    
    var qqfile = req.files.qqfile;
    var store = this.store;
    var path = store.path(qqfile.name, req);

    if (qqfile.size > parseInt(req.param('sizeLimit', Number.MAX_VALUE))) 
      return res.send(JSON.stringify({success: false, error: qqfile.name + ' ist zu gross.'}));

    fs.readFile(qqfile.path, function(err, buf) {
      if (err) return res.send(JSON.stringify({success:false, error: err.message}));
      if (!buf.length) return res.json(JSON.stringify({success: false, error: 'empty file'}));

      var s = store.stream(meta, buf.length);
      
      store.on('error', function (err) {
        res.send(JSON.stringify({success: false}));
      });

      store.on('done', function (url) {
        //content-type applicatin/json (req.json(..)) is not handled properly by ie8
        //therefore send as text/plain
        res.send(JSON.stringify({success: true, url: url + '?' + Date.now() }));
      });

      s.end(buf);

    });

  });
};
