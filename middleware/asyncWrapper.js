function asyncWrapper(foo) {
  return (req, res, next) => Promise.resolve(foo(req, res, next)).catch(next);
}

module.exports = asyncWrapper;
