const mongoose = require('mongoose');
const Counter = require('./Counter');

const quizSchema = new mongoose.Schema(
    {
        quizId: { type: Number, unique: true, index: true },
        title: { type: String, required: true, trim: true },
        questionCount: { type: Number, default: 0, min: 0 },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'inactive',
        },
        duration: { type: Number, required: true, min: 1 },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
    },
    { timestamps: true }
);

// Auto-increment quizId (unique integer) on first save.
quizSchema.pre('save', async function (next) {
  try {
    if (!this.isNew) return next();
    if (this.quizId != null) return next();

    const counter = await Counter.findByIdAndUpdate(
      'quizId',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.quizId = counter.seq;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Quiz', quizSchema);
