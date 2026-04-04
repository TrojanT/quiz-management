const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const userQuizController = require('../controllers/userQuizController');

const router = express.Router();

router.get('/quiz-stats', protect, userQuizController.getQuizStats);

module.exports = router;
