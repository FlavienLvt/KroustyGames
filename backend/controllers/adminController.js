const User  = require('../models/User');
const Score = require('../models/Score');
const bcrypt = require('bcryptjs');

// ── USERS ──────────────────────────────────────────────────────────────────

async function getUsers(req, res) {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    console.error('Admin getUsers:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { username, email, role, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const updates = {};
    if (username) updates.username = username;
    if (email)    updates.email    = email;
    if (role && ['admin', 'user'].includes(role)) updates.role = role;
    if (password) updates.password = await bcrypt.hash(password, 10);

    await user.update(updates);
    res.json({ message: 'Utilisateur mis à jour.', user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Admin updateUser:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte.' });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    await user.destroy();
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (error) {
    console.error('Admin deleteUser:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

// ── SCORES ─────────────────────────────────────────────────────────────────

async function getScores(req, res) {
  try {
    const { gameSlug } = req.query;
    const where = gameSlug ? { gameSlug } : {};

    const scores = await Score.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['username'] }]
    });
    res.json(scores);
  } catch (error) {
    console.error('Admin getScores:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

async function updateScore(req, res) {
  try {
    const { id } = req.params;
    const { score } = req.body;

    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({ message: 'Score invalide.' });
    }

    const entry = await Score.findByPk(id);
    if (!entry) return res.status(404).json({ message: 'Score introuvable.' });

    await entry.update({ score });
    res.json({ message: 'Score mis à jour.', entry });
  } catch (error) {
    console.error('Admin updateScore:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

async function deleteScore(req, res) {
  try {
    const { id } = req.params;

    const entry = await Score.findByPk(id);
    if (!entry) return res.status(404).json({ message: 'Score introuvable.' });

    await entry.destroy();
    res.json({ message: 'Score supprimé.' });
  } catch (error) {
    console.error('Admin deleteScore:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

module.exports = { getUsers, updateUser, deleteUser, getScores, updateScore, deleteScore };
