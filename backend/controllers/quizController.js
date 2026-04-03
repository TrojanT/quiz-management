const Quiz = require('../models/Quiz');
const Category = require('../models/Category');

const parseQuizIdParam = (raw) => {
    const n = Number(raw);
    if (!Number.isInteger(n)) return null;
    return n;
};

const parseStatus = (raw) => {
    const s = String(raw || '').toLowerCase();
    if (!['active', 'inactive'].includes(s)) return null;
    return s;
};

const getQuiz = async (req, res) => {
    try {
        const quizIdNum = parseQuizIdParam(req.params.id);
        if (quizIdNum == null) {
            return res.status(400).json({ message: 'Invalid quiz id' });
        }

        const q = await Quiz.findOne({ quizId: quizIdNum })
            .populate('category', 'name')
            .lean();

        if (!q) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.json({
            id: q.quizId,
            title: q.title,
            questionCount: q.questionCount,
            status: q.status,
            duration: q.duration,
            categoryId: q.category?._id?.toString(),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const listQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find()
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .lean();

        const cleaned = quizzes.filter((q) => Number.isInteger(q.quizId));
        res.json(
            cleaned.map((q) => ({
                id: q.quizId,
                title: q.title,
                questionCount: q.questionCount,
                status: q.status,
                duration: q.duration,
                category: q.category?.name || '—',
                categoryId: q.category?._id?.toString(),
                updatedAt: q.updatedAt,
            }))
        );
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createQuiz = async (req, res) => {
    try {
        const { title, questionCount, duration, status, categoryId } = req.body;
        if (!title || !String(title).trim()) {
            return res.status(400).json({ message: 'Title is required' });
        }
        if (!categoryId) {
            return res.status(400).json({ message: 'Category is required' });
        }
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(400).json({ message: 'Invalid category' });
        }
        const durationNum = Number(duration);
        if (!Number.isFinite(durationNum) || durationNum < 1) {
            return res.status(400).json({ message: 'Duration must be at least 1 minute' });
        }
        const count = Math.max(0, Math.floor(Number(questionCount)) || 0);
        const statusParsed = parseStatus(status);
        if (!statusParsed) {
            return res.status(400).json({ message: 'Status must be active or inactive' });
        }
        const quiz = await Quiz.create({
            title: String(title).trim(),
            questionCount: count,
            duration: durationNum,
            status: statusParsed,
            category: categoryId,
        });
        const populated = await Quiz.findById(quiz._id).populate('category', 'name').lean();
        res.status(201).json({
            id: populated.quizId,
            title: populated.title,
            questionCount: populated.questionCount,
            status: populated.status,
            duration: populated.duration,
            category: populated.category?.name || '—',
            categoryId: populated.category?._id?.toString(),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateQuiz = async (req, res) => {
    try {
        const quizIdNum = parseQuizIdParam(req.params.id);
        if (quizIdNum == null) {
            return res.status(400).json({ message: 'Invalid quiz id' });
        }
        const quiz = await Quiz.findOne({ quizId: quizIdNum });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        const { title, questionCount, duration, status, categoryId } = req.body;
        if (title != null) quiz.title = String(title).trim();
        if (questionCount != null) quiz.questionCount = Math.max(0, Math.floor(Number(questionCount)) || 0);
        if (duration != null) {
            const d = Number(duration);
            if (!Number.isFinite(d) || d < 1) {
                return res.status(400).json({ message: 'Duration must be at least 1 minute' });
            }
            quiz.duration = d;
        }
        if (status != null) {
            const statusParsed = parseStatus(status);
            if (!statusParsed) {
                return res.status(400).json({ message: 'Status must be active or inactive' });
            }
            quiz.status = statusParsed;
        }
        if (categoryId != null) {
            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(400).json({ message: 'Invalid category' });
            }
            quiz.category = categoryId;
        }
        await quiz.save();
        const populated = await Quiz.findById(quiz._id).populate('category', 'name').lean();
        res.json({
            id: populated.quizId,
            title: populated.title,
            questionCount: populated.questionCount,
            status: populated.status,
            duration: populated.duration,
            category: populated.category?.name || '—',
            categoryId: populated.category?._id?.toString(),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteQuiz = async (req, res) => {
    try {
        const quizIdNum = parseQuizIdParam(req.params.id);
        if (quizIdNum == null) {
            return res.status(400).json({ message: 'Invalid quiz id' });
        }
        const deleted = await Quiz.findOneAndDelete({ quizId: quizIdNum });
        if (!deleted) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getQuiz, listQuizzes, createQuiz, updateQuiz, deleteQuiz };
