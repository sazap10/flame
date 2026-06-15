const { join } = require('path');
const express = require('express');
const helmet = require('helmet');
const { errorHandler } = require('./middleware');

const api = express();

// Security headers (X-Content-Type-Options, Referrer-Policy, frame options,
// etc.). CSP is disabled because the SPA relies on inline theming, custom CSS,
// and externally-loaded SVG icons that a default policy would block.
api.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Static files
api.use(express.static(join(__dirname, 'public')));
api.use('/uploads', express.static(join(__dirname, 'data/uploads')));
api.get(/^\/(?!api)/, (req, res) => {
  res.sendFile(join(__dirname, 'public/index.html'));
});

// Body parser
api.use(express.json());

// Link controllers with routes
api.use('/api/apps', require('./routes/apps'));
api.use('/api/config', require('./routes/config'));
api.use('/api/weather', require('./routes/weather'));
api.use('/api/categories', require('./routes/category'));
api.use('/api/bookmarks', require('./routes/bookmark'));
api.use('/api/queries', require('./routes/queries'));
api.use('/api/auth', require('./routes/auth'));
api.use('/api/themes', require('./routes/themes'));

// Custom error handler
api.use(errorHandler);

module.exports = api;
