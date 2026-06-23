const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

const { sequelize } = require('./database');
require('./models/Badge');
require('./models/UserBadge');
const gameRoutes  = require('./routes/gameRoutes');
const authRoutes  = require('./routes/auth');
const scoreRoutes = require('./routes/scores');
const badgeRoutes = require('./routes/badges');
const adminRoutes = require('./routes/admin');
const { seedGames }       = require('./seeders/gameSeeders');
const { seedUsers }       = require('./seeders/userSeeders');
const { seedScores }      = require('./seeders/scoreSeeders');
const { seedBadges, seedUserBadges } = require('./seeders/badgeSeeders');

app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://frontend:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

const PORT           = process.env.PORT           || 5000;
const DB_MAX_RETRIES = Number(process.env.DB_MAX_RETRIES    || 20);
const DB_RETRY_DELAY_MS = Number(process.env.DB_RETRY_DELAY_MS || 2000);

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.use('/api/auth',   authRoutes);
app.use('/api',        gameRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api',        badgeRoutes);
app.use('/api/admin',  adminRoutes);

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
      if (attempt >= DB_MAX_RETRIES) throw error;
      await sleep(DB_RETRY_DELAY_MS);
    }
  }
}

async function bootstrap() {
  try {
    await connectWithRetry();
    await sequelize.sync({ alter: true });
    await seedGames();
    await seedUsers();
    await seedScores();
    await seedBadges();
    await seedUserBadges();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start backend:', error);
    process.exit(1);
  }
}

bootstrap();
