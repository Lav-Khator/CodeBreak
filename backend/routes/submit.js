const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { executeCode } = require('../services/executor');

// ─── POST /api/submit ──────────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  const { problemSlug, language, code, contestId } = req.body;

  if (!problemSlug || !language || !code) {
    return res.status(400).json({ success: false, message: 'problemSlug, language, and code are required' });
  }

  const SUPPORTED = ['cpp', 'python', 'java', 'javascript'];
  if (!SUPPORTED.includes(language)) {
    return res.status(400).json({ success: false, message: `Unsupported language: ${language}` });
  }

  // Fetch problem with test cases (normally hidden from frontend)
  const problem = await Problem.findOne({ slug: problemSlug, isApproved: true });
  if (!problem) {
    return res.status(404).json({ success: false, message: 'Problem not found' });
  }

  if (!problem.testCases || problem.testCases.length === 0) {
    return res.status(400).json({ success: false, message: 'This problem has no test cases configured yet' });
  }

  // Create pending submission record
  const submission = await Submission.create({
    user: req.user._id,
    problem: problem._id,
    contest: contestId || null,
    language,
    code,
    verdict: 'Pending',
    totalTests: problem.testCases.length,
  });

  try {
    // Run code against all test cases
    const result = await executeCode({
      language,
      code,
      testCases: problem.testCases,
    });

    // Update submission with result
    submission.verdict = result.verdict;
    submission.passedTests = result.passedTests;
    submission.runtime = result.runtime;
    submission.errorOutput = result.errorOutput;
    await submission.save();

    // Update problem stats
    problem.totalSubmissions += 1;
    if (result.verdict === 'Accepted') {
      problem.acceptedSubmissions += 1;
    }
    await problem.save();

    // If accepted, bump solver rating — ONLY on first-ever accepted submission for this problem
    if (result.verdict === 'Accepted') {
      const previousAccepted = await Submission.findOne({
        user: req.user._id,
        problem: problem._id,
        verdict: 'Accepted',
        _id: { $ne: submission._id }, // exclude the submission we just created
      });
      if (!previousAccepted) {
        await User.findByIdAndUpdate(req.user._id, { $inc: { solverRating: 10 } });
      }
    }

    return res.json({
      success: true,
      submission: {
        _id: submission._id,
        verdict: result.verdict,
        passedTests: result.passedTests,
        totalTests: result.totalTests,
        runtime: result.runtime,
        errorOutput: result.errorOutput,
        language,
      },
    });
  } catch (err) {
    // Execution itself crashed (Docker not running, etc.)
    submission.verdict = 'Runtime Error';
    submission.errorOutput = err.message;
    await submission.save();

    console.error('Execution error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Code execution failed. Make sure Docker is running.',
      error: err.message,
    });
  }
});

// ─── GET /api/submit/history/:problemSlug ──────────────────────────────────────
router.get('/history/:problemSlug', protect, async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.problemSlug });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

    const submissions = await Submission.find({ user: req.user._id, problem: problem._id })
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/submit/solved ────────────────────────────────────────────────────
// Returns array of problem IDs the logged-in user has solved (coding + break)
router.get('/solved', protect, async (req, res) => {
  try {
    const BreakSubmission = require('../models/BreakSubmission');

    const [codingSolved, breakSolved] = await Promise.all([
      Submission.find({ user: req.user._id, verdict: 'Accepted' }).distinct('problem'),
      BreakSubmission.find({ user: req.user._id, result: 'Broken' }).distinct('problem'),
    ]);

    const allSolved = [...new Set([...codingSolved.map(String), ...breakSolved.map(String)])];
    res.json({ success: true, solvedIds: allSolved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
