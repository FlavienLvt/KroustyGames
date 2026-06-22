const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, scoreController.saveScore);
router.get('/:gameSlug', scoreController.getLeaderboard);

module.exports = router;
