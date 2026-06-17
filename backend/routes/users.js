const express = require('express');
const router  = express.Router();
const User            = require('../models/User');
const Submission      = require('../models/Submission');
const BreakSubmission = require('../models/BreakSubmission');

// ─── GET /api/users/:username ─────────────────────────────────────────────────
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -googleId -email');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/users/:username/submissions ──────────────────────────────────────
router.get('/:username/submissions', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Coding submissions
    const codingSubs = await Submission.find({ user: user._id })
      .populate('problem', 'title slug difficulty type')
      .select('-code')
      .sort({ createdAt: -1 })
      .limit(100);

    // Break-the-code submissions
    const breakSubs = await BreakSubmission.find({ user: user._id })
      .populate('problem', 'title slug difficulty type')
      .sort({ createdAt: -1 })
      .limit(100);

    // Normalise break subs to share shape with coding subs
    const normalisedBreak = breakSubs.map((b) => ({
      _id:       b._id,
      createdAt: b.createdAt,
      problem:   b.problem,
      verdict:   b.result === 'Broken' ? 'Accepted' : 'Wrong Answer',
      language:  'input',    // break subs have no language
      kind:      'break',    // so UI can label them differently
      result:    b.result,
    }));

    // Merge and sort newest-first
    const all = [...codingSubs.map(s => ({ ...s.toObject(), kind: 'coding' })), ...normalisedBreak]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 100);

    res.json({ success: true, submissions: all });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
