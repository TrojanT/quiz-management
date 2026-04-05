const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const User = require('../models/User');

const getDashboardStats = async (req, res) => {
  try {
    const [totalQuizzes, totalQuestions, totalUsers] = await Promise.all([
      Quiz.countDocuments(),
      Question.countDocuments(),
      User.countDocuments(),
    ]);
    res.json({ totalQuizzes, totalQuestions, totalUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
