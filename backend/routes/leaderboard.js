const express = require('express');
const router  = express.Router();
const User       = require('../models/User');
const Submission = require('../models/Submission');

// Helper: count accepted submissions per user
async function addSolveCounts(users, type = 'coding') {
  const ids = users.map((u) => u._id);
  const counts = await Submission.aggregate([
    { $match: { user: { $in: ids }, verdict: 'Accepted' } },
    { $group: { _id: '$user', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
  return users.map((u) => ({
    ...u.toObject(),
    solvedCount: countMap[u._id.toString()] ?? 0,
  }));
}

// ─── GET /api/leaderboard/solvers ─────────────────────────────────────────────
router.get('/solvers', async (req, res) => {
  try {
    const users = await User.find()
      .select('username avatar solverRating streak createdAt')
      .sort({ solverRating: -1 })
      .limit(50);
    const withCounts = await addSolveCounts(users);
    res.json({ success: true, users: withCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/leaderboard/breakers ────────────────────────────────────────────
router.get('/breakers', async (req, res) => {
  try {
    const users = await User.find()
      .select('username avatar breakerRating streak createdAt')
      .sort({ breakerRating: -1 })
      .limit(50);
    const withCounts = await addSolveCounts(users);
    res.json({ success: true, users: withCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
