// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'kroustygames_secret_key_temp';

module.exports = (req, res, next) => {
  // On récupère le token dans l'en-tête "Authorization: Bearer <token>"
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Accès refusé. Token manquant.' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // On stocke les infos de l'utilisateur (userId, username) dans req.user
    next(); // On laisse passer à la route de sauvegarde !
  } catch (error) {
    res.status(403).json({ message: 'Token invalide ou expiré.' });
  }
};