var json = require('./json.js')();

exports = module.exports = function bodyParser() {
  return function bodyParser(req, res, next) {
    json(req, res, next);
  };
};