const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ─── GET /api/leaderboard/solvers ─────────────────────────────────────────────
router.get('/solvers', async (req, res) => {
  try {
    const users = await User.find()
      .select('username avatar solverRating streak createdAt')
      .sort({ solverRating: -1 })
      .limit(20);
    res.json({ success: true, users });
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
      .limit(20);
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
