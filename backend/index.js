const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { sequelize } = require('./database');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const { listGames, getGameBySlug, seedGames } = require('./services/gameService');
const { seedUsers } = require('./services/userService');
const scoreRoutes = require('./routes/scores');
const { seedScores } = require('./services/scoreService');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const DB_MAX_RETRIES = Number(process.env.DB_MAX_RETRIES || 20);
const DB_RETRY_DELAY_MS = Number(process.env.DB_RETRY_DELAY_MS || 2000);

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.get('/api/games', async (req, res) => {
  try {
    const games = await listGames(req.query.section);

    res.json(games);
  } catch (error) {
    console.error('Failed to load games:', error);
    res.status(500).json({ message: 'Impossible de charger les jeux.' });
  }
});

app.get('/api/games/:slug', async (req, res) => {
  try {
    const game = await getGameBySlug(req.params.slug);

    if (!game) {
      return res.status(404).json({ message: 'Jeu introuvable.' });
    }

    res.json(game);
  } catch (error) {
    console.error('Failed to load game:', error);
    res.status(500).json({ message: 'Impossible de charger le jeu.' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectWithRetry() {
  let attempt = 0;

  while (attempt < DB_MAX_RETRIES) {
    try {
      await sequelize.authenticate();
      return;
    } catch (error) {
      attempt += 1;
      console.error(`Database connection failed (${attempt}/${DB_MAX_RETRIES})`);

      if (attempt >= DB_MAX_RETRIES) {
        throw error;
      }

      await sleep(DB_RETRY_DELAY_MS);
    }
  }
}

async function bootstrap() {
  try {
    await connectWithRetry();
    await sequelize.sync();
    await seedGames();
    await seedUsers();
    await seedScores();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start backend:', error);
    process.exit(1);
  }
}

bootstrap();