const jwt = require('jsonwebtoken');
module.exports = function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return next();
  const token = authHeader.split(' ')[1];
  if (!token) return next();
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_) {
    // token invalide — on continue sans user
  }
  next();
};
