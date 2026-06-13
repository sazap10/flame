const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // When anonymous auth is enabled every request is treated as authenticated.
  // Intended for instances behind a trusted reverse proxy / private network.
  if (process.env.ANONYMOUS_AUTH === 'true') {
    req.isAuthenticated = true;
    return next();
  }

  const authHeader = req.header('Authorization-Flame');
  let token;
  let tokenIsValid = false;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (token) {
    try {
      jwt.verify(token, process.env.SECRET);
      tokenIsValid = true;
    } catch {}
  }

  req.isAuthenticated = tokenIsValid;

  next();
};

module.exports = auth;
