const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SECRET_KEY = process.env.JWT_SECRET || 'kroustygames_secret_key_temp';

async function registerUser(username, email, password) {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    const error = new Error('Cet email est déjà utilisé.');
    error.status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ username, email, password: hashedPassword });
  return newUser;
}

async function loginUser(email, password) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const error = new Error('Utilisateur introuvable.');
    error.status = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Mot de passe incorrect.');
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    SECRET_KEY,
    { expiresIn: '24h' }
  );

  return { token, username: user.username };
}

module.exports = { registerUser, loginUser };
