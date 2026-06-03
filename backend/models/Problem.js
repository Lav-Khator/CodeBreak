const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String, default: '' },
}, { _id: false });

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: true },
}, { _id: false });

const starterCodeSchema = new mongoose.Schema({
  cpp: { type: String, default: '' },
  python: { type: String, default: '' },
  java: { type: String, default: '' },
  javascript: { type: String, default: '' },
}, { _id: false });

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: ['coding', 'break-the-code'],
      default: 'coding',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    tags: [{ type: String, trim: true }],
    description: {
      type: String,
      required: true,
    },
    examples: [exampleSchema],
    constraints: [{ type: String }],
    testCases: [testCaseSchema],
    starterCode: { type: starterCodeSchema, default: () => ({}) },

    // Stats
    totalSubmissions: { type: Number, default: 0 },
    acceptedSubmissions: { type: Number, default: 0 },

    // Daily challenge
    isProblemOfDay: { type: Boolean, default: false },
    problemOfDayDate: { type: Date, default: null },

    // For break-the-code: the buggy code
    buggyCode: { type: String, default: '' },
    bugCategory: { type: String, default: '' }, // for AI hint

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate slug from title
problemSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

// Virtual: acceptance rate
problemSchema.virtual('acceptanceRate').get(function () {
  if (this.totalSubmissions === 0) return 0;
  return Math.round((this.acceptedSubmissions / this.totalSubmissions) * 100);
});

problemSchema.set('toJSON', { virtuals: true });
problemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Problem', problemSchema);
