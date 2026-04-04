const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const quizController = require('../controllers/quizController');
const categoryController = require('../controllers/categoryController');
const questionController = require('../controllers/questionController');

const router = express.Router();

router.get('/questions', protect, questionController.listQuestions);
router.post('/questions', protect, questionController.createQuestion);
router.put('/questions/:id', protect, questionController.updateQuestion);
router.delete('/questions/:id', protect, questionController.deleteQuestion);

router.get('/quizzes/:quizId/questions', protect, questionController.listQuestions);
router.post('/quizzes/:quizId/questions', protect, questionController.createQuestion);

router.get('/quizzes', protect, quizController.listQuizzes);
router.get('/quizzes/:id', protect, quizController.getQuiz);
router.post('/quizzes', protect, quizController.createQuiz);
router.put('/quizzes/:id', protect, quizController.updateQuiz);
router.delete('/quizzes/:id', protect, quizController.deleteQuiz);

router.get('/categories', protect, categoryController.listCategories);
router.post('/categories', protect, categoryController.createCategory);
router.delete('/categories/:id', protect, categoryController.deleteCategory);

module.exports = router;
