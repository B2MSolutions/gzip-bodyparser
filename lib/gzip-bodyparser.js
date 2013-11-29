exports = module.exports = function bodyParser() {
  return function bodyParser(req, res, next) {
    return next();
  };
};