const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    language: { type: String, enum: ['cpp', 'python', 'java', 'javascript'], required: true },
    code: { type: String, required: true },
    verdict: {
      type: String,
      enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compile Error', 'Pending'],
      default: 'Pending',
    },
    runtime: { type: Number, default: 0 },   // ms
    memory: { type: Number, default: 0 },    // KB
    passedTests: { type: Number, default: 0 },
    totalTests: { type: Number, default: 0 },
    errorOutput: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Submission', submissionSchema);
