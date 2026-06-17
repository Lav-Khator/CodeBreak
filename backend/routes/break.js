const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Problem         = require('../models/Problem');
const BreakSubmission = require('../models/BreakSubmission');
const User            = require('../models/User');
const { executeCode } = require('../services/executor');

// ─── POST /api/break/:slug ─────────────────────────────────────────────────────
// User submits an input trying to break the buggy code.
// We run both buggy and correct code; if outputs differ → Broken!
router.post('/:slug', protect, async (req, res) => {
  const { input } = req.body;
  if (!input || !input.trim()) {
    return res.status(400).json({ success: false, message: 'Input cannot be empty' });
  }

  const problem = await Problem.findOne({ slug: req.params.slug, type: 'break-the-code', isApproved: true });
  if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

  if (!problem.buggyCode || !problem.correctCode) {
    return res.status(400).json({ success: false, message: 'Problem not fully configured yet' });
  }

  try {
    // Run buggy code and correct code against the user's input in parallel
    const fakeTestCase = [{ input, expectedOutput: '__IGNORE__' }];

    const [buggyResult, correctResult] = await Promise.all([
      executeCode({ language: problem.buggyLanguage || 'cpp', code: problem.buggyCode,   testCases: fakeTestCase }),
      executeCode({ language: problem.correctLanguage || 'cpp', code: problem.correctCode, testCases: fakeTestCase }),
    ]);

    // Extract raw outputs (executor marks WA when outputs differ from __IGNORE__, that's fine)
    // We need actual stdout — re-use executor's internal logic by checking errorOutput for WA
    const normalize = (s) => (s || '').replace(/\r\n/g, '\n').trim();

    const buggyOut   = buggyResult.verdict === 'Compile Error' || buggyResult.verdict === 'Runtime Error'
      ? `[${buggyResult.verdict}]` : buggyResult.errorOutput?.replace(/^Test 1:\nExpected: __IGNORE__\nGot:\s*/,'').trim() || '';
    const correctOut = correctResult.verdict === 'Compile Error' || correctResult.verdict === 'Runtime Error'
      ? `[${correctResult.verdict}]` : correctResult.errorOutput?.replace(/^Test 1:\nExpected: __IGNORE__\nGot:\s*/,'').trim() || '';

    // Determine if the buggy code "broke":
    // Rule: correct code MUST run cleanly — if correct also crashes, the input is just invalid
    const correctFailed = ['Runtime Error', 'Compile Error', 'Time Limit Exceeded'].includes(correctResult.verdict);
    const buggyFailed   = ['Runtime Error', 'Compile Error', 'Time Limit Exceeded'].includes(buggyResult.verdict);
    const outputsDiffer = normalize(buggyOut) !== normalize(correctOut);

    // Only "Broken" if correct code succeeds AND buggy code differs from it
    const broken = !correctFailed && (buggyFailed || outputsDiffer);


    const result = broken ? 'Broken' : 'Not Broken';

    // Save submission
    const sub = await BreakSubmission.create({
      user: req.user._id,
      problem: problem._id,
      input,
      result,
      buggyOutput:   buggyOut,
      correctOutput: correctOut,
    });

    // Update stats
    problem.totalSubmissions += 1;
    if (broken) problem.acceptedSubmissions += 1;
    await problem.save();

    // Reward user — only on FIRST break of this problem
    if (broken) {
      const previousBreak = await BreakSubmission.findOne({
        user: req.user._id,
        problem: problem._id,
        result: 'Broken',
        _id: { $ne: sub._id },
      });
      if (!previousBreak) {
        await User.findByIdAndUpdate(req.user._id, { $inc: { breakerRating: 10 } });
      }
    }

    res.json({
      success: true,
      result,
      broken,
      buggyOutput:   buggyOut,
      correctOutput: correctOut,
      message: broken
        ? '💥 You broke it! The buggy code produced wrong output.'
        : correctFailed
          ? '⚠️ Your input caused BOTH codes to crash — this is not a valid break. Try an input the correct code can handle.'
          : '✗ The code did not break with this input. Try a different one!',
    });

  } catch (err) {
    console.error('Break execution error:', err.message);
    res.status(500).json({ success: false, message: 'Execution failed. Is Docker running?' });
  }
});

// ─── GET /api/break/:slug/history ─────────────────────────────────────────────
router.get('/:slug/history', protect, async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) return res.status(404).json({ success: false, message: 'Not found' });

    const subs = await BreakSubmission.find({ user: req.user._id, problem: problem._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, submissions: subs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
