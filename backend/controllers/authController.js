const authService = require('../services/authService');
const { checkAndAwardBadges } = require('../services/badgeService');

async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    const newUser = await authService.registerUser(username, email, password);
    await checkAndAwardBadges(newUser.id);
    res.status(201).json({ message: 'Compte créé avec succès !' });
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(error.status || 500).json({ message: error.message || 'Erreur lors de la création du compte.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const { token, username, role } = await authService.loginUser(email, password);
    res.json({ message: 'Connexion réussie', token, username, role });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(error.status || 500).json({ message: error.message || 'Erreur lors de la connexion.' });
  }
}

module.exports = { register, login };
