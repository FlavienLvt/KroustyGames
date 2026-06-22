const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');
const optionalAuth = require('../middleware/optionalAuthMiddleware');

router.get('/badges', optionalAuth, badgeController.getBadges);
router.get('/badges/leaderboard', badgeController.getLeaderboard);

module.exports = router;
