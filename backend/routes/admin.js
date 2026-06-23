const express        = require('express');
const router         = express.Router();
const authMiddleware  = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

router.use(authMiddleware);
router.use(adminMiddleware);

// Users CRUD
router.get('/users',        adminController.getUsers);
router.put('/users/:id',    adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Scores CRUD
router.get('/scores',        adminController.getScores);
router.put('/scores/:id',    adminController.updateScore);
router.delete('/scores/:id', adminController.deleteScore);

module.exports = router;
