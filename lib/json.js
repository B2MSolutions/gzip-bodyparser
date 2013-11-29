hasBody = function (req) {
  var encoding = 'transfer-encoding' in req.headers,
    length = 'content-length' in req.headers && req.headers['content-length'] !== '0';
  return encoding || length;
};

hasGzipContentEncoding = function (req) {
  return 'content-encoding' in req.headers && req.headers['content-encoding'] === 'gzip';
};

hasJsonContentType = function (req) {
  return 'content-type' in req.headers && req.headers['content-type'] === 'application/json';
};

exports = module.exports = function() {
  return function json(req, res, next) {

    if (req._body) {
      return next();
    }

    req.body = req.body || {};

    if (!hasBody(req)) {
      return next();
    }

    if (!hasGzipContentEncoding(req)) {
      return next();
    }

    if (!hasJsonContentType(req)) {
      return next();
    }

    req._body = true;

    var data = [];
    req.on("data", function(chunk) {
      data.push(new Buffer(chunk));
    });
    
    req.on("end", function() {
      buffer = Buffer.concat(data);
      req.rawBody = buffer.toString();
      try {
        req.body = JSON.parse(buffer.toString());
      } catch(err) {
        err.body = buffer.toString();
        err.status = 400;
        return next(err);
      }
      
      next();
    });
  };
};