const mongoose = require('mongoose');

const breakSubmissionSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    input:   { type: String, required: true },
    result:  { type: String, enum: ['Broken', 'Not Broken', 'Error'], default: 'Not Broken' },
    buggyOutput:   { type: String, default: '' },
    correctOutput: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BreakSubmission', breakSubmissionSchema);
