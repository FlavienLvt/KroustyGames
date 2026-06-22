const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'kroustygames_secret_key_temp';

module.exports = function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return next();
  const token = authHeader.split(' ')[1];
  if (!token) return next();
  try {
    req.user = jwt.verify(token, SECRET_KEY);
  } catch (_) {
    // token invalide — on continue sans user
  }
  next();
};
