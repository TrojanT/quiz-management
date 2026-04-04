const mongoose = require('mongoose');

const OPTION_COUNT = 4;

const questionSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    questionNo: { type: Number, required: true, min: 1 },
    text: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator(v) {
          if (!Array.isArray(v) || v.length !== OPTION_COUNT) return false;
          return v.every((s) => String(s || '').trim().length > 0);
        },
        message: `Exactly ${OPTION_COUNT} non-empty answer choices are required`,
      },
    },
    correctIndex: { type: Number, required: true, min: 0, max: OPTION_COUNT - 1 },
    marks: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

questionSchema.pre('validate', function (next) {
  if (Array.isArray(this.options) && Number.isInteger(this.correctIndex)) {
    if (this.correctIndex < 0 || this.correctIndex >= this.options.length) {
      this.invalidate('correctIndex', 'Correct answer must be one of A–D');
    }
  }
  next();
});

questionSchema.index({ quiz: 1, questionNo: 1 }, { unique: true });

module.exports = mongoose.model('Question', questionSchema);
