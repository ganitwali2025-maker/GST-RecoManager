const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateToken = (userId, role, email) => {
  return jwt.sign(
    { userId, role, email },
    config.jwtSecret || 'fallback_secret',
    { expiresIn: config.jwtExpiresIn || '1d' }
  );
};

module.exports = { generateToken };
