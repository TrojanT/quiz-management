const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

const OPTION_COUNT = 4;

const parseQuizIdParam = (raw) => {
  const n = Number(raw);
  if (!Number.isInteger(n)) return null;
  return n;
};

const findQuizByQuizId = async (quizIdNum) => Quiz.findOne({ quizId: quizIdNum });

const syncQuestionCount = async (quizMongoId) => {
  const count = await Question.countDocuments({ quiz: quizMongoId });
  await Quiz.updateOne({ _id: quizMongoId }, { $set: { questionCount: count } });
};

const normalizeOptions = (raw) => {
  if (!Array.isArray(raw) || raw.length !== OPTION_COUNT) return null;
  const opts = raw.map((s) => String(s ?? '').trim());
  if (opts.some((o) => !o)) return null;
  return opts;
};

const toRow = (q) => ({
  id: q._id.toString(),
  questionNo: q.questionNo,
  text: q.text,
  options: q.options,
  correctIndex: q.correctIndex,
  correctAnswer: q.options?.[q.correctIndex] ?? '',
  marks: q.marks,
});

const resolveListQuizId = (req) =>
  parseQuizIdParam(req.params.quizId) ?? parseQuizIdParam(req.query.quizId);

const resolveCreateQuizId = (req) =>
  parseQuizIdParam(req.params.quizId) ?? parseQuizIdParam(req.body?.quizId);

const listQuestions = async (req, res) => {
  try {
    const quizIdNum = resolveListQuizId(req);
    if (quizIdNum == null) {
      return res.status(400).json({ message: 'Quiz id is required' });
    }
    const quiz = await findQuizByQuizId(quizIdNum);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    const rows = await Question.find({ quiz: quiz._id }).sort({ questionNo: 1 }).lean();
    res.json(rows.map(toRow));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createQuestion = async (req, res) => {
  try {
    const quizIdNum = resolveCreateQuizId(req);
    if (quizIdNum == null) {
      return res.status(400).json({ message: 'Quiz id is required' });
    }
    const quiz = await findQuizByQuizId(quizIdNum);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const { text, options, correctIndex, marks, questionNo } = req.body;
    if (!text || !String(text).trim()) {
      return res.status(400).json({ message: 'Question text is required' });
    }
    const opts = normalizeOptions(options);
    if (!opts) {
      return res.status(400).json({
        message: `Provide exactly ${OPTION_COUNT} non-empty answer choices (A–D)`,
      });
    }
    const idx = Math.floor(Number(correctIndex));
    if (!Number.isInteger(idx) || idx < 0 || idx >= OPTION_COUNT) {
      return res.status(400).json({ message: 'Select which choice is correct (A–D)' });
    }
    const marksNum = Number(marks);
    if (!Number.isFinite(marksNum) || marksNum < 0) {
      return res.status(400).json({ message: 'Marks must be a non-negative number' });
    }

    const no = Math.floor(Number(questionNo));
    if (!Number.isInteger(no) || no < 1) {
      return res.status(400).json({ message: 'Question number is required and must be a positive integer' });
    }

    const doc = await Question.create({
      quiz: quiz._id,
      questionNo: no,
      text: String(text).trim(),
      options: opts,
      correctIndex: idx,
      marks: marksNum,
    });
    await syncQuestionCount(quiz._id);
    res.status(201).json(toRow(doc.toObject()));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Question number already exists for this quiz' });
    }
    res.status(500).json({ message: error.message });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) {
      return res.status(404).json({ message: 'Question not found' });
    }
    const { text, options, correctIndex, marks, questionNo } = req.body;
    if (questionNo == null || questionNo === '') {
      return res.status(400).json({ message: 'Question number is required' });
    }
    const qNo = Math.floor(Number(questionNo));
    if (!Number.isInteger(qNo) || qNo < 1) {
      return res.status(400).json({ message: 'Question number must be a positive integer' });
    }
    q.questionNo = qNo;

    if (text != null) q.text = String(text).trim();

    const opts = normalizeOptions(options);
    if (!opts) {
      return res.status(400).json({
        message: `Provide exactly ${OPTION_COUNT} non-empty answer choices (A–D)`,
      });
    }
    q.options = opts;

    const idx = Math.floor(Number(correctIndex));
    if (!Number.isInteger(idx) || idx < 0 || idx >= OPTION_COUNT) {
      return res.status(400).json({ message: 'Select which choice is correct (A–D)' });
    }
    q.correctIndex = idx;

    if (marks != null) {
      const marksNum = Number(marks);
      if (!Number.isFinite(marksNum) || marksNum < 0) {
        return res.status(400).json({ message: 'Marks must be a non-negative number' });
      }
      q.marks = marksNum;
    }
    await q.save();
    await syncQuestionCount(q.quiz);
    const lean = await Question.findById(q._id).lean();
    res.json(toRow(lean));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Question number already exists for this quiz' });
    }
    res.status(500).json({ message: error.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Question not found' });
    }
    await syncQuestionCount(deleted.quiz);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { listQuestions, createQuestion, updateQuestion, deleteQuestion };
