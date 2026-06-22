// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { checkAndAwardBadges } = require('../services/badgeService');

const router = express.Router();

// Clé secrète pour les tokens (à mettre dans ton .env idéalement : JWT_SECRET=mon_super_secret)
const SECRET_KEY = process.env.JWT_SECRET || 'kroustygames_secret_key_temp';

// --- INSCRIPTION (REGISTER) ---
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    // 2. Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Créer l'utilisateur
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });

    await checkAndAwardBadges(newUser.id);
    res.status(201).json({ message: 'Compte créé avec succès !' });
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({ message: 'Erreur lors de la création du compte.' });
  }
});

// --- CONNEXION (LOGIN) ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Trouver l'utilisateur
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    // 2. Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    // 3. Générer le Token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.json({ message: 'Connexion réussie', token, username: user.username });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion.' });
  }
});

module.exports = router;