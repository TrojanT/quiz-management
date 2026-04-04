const Quiz = require('../models/Quiz');

const getQuizStats = async (req, res) => {
  try {
    const availableQuizzes = await Quiz.countDocuments({ status: 'active' });
    res.json({ availableQuizzes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getQuizStats };
