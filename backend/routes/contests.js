const express = require('express');
const router = express.Router();
const Contest = require('../models/Contest');
const { protect } = require('../middleware/authMiddleware');

// ─── GET /api/contests ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const contests = await Contest.find({ isApproved: true })
      .populate('hostedBy', 'username avatar')
      .populate('problems', 'title difficulty type')
      .sort({ startTime: -1 });
    res.json({ success: true, contests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/contests/upcoming ───────────────────────────────────────────────
router.get('/upcoming', async (req, res) => {
  try {
    const now = new Date();
    const contests = await Contest.find({ isApproved: true, startTime: { $gt: now } })
      .populate('hostedBy', 'username')
      .sort({ startTime: 1 })
      .limit(5);
    res.json({ success: true, contests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/contests/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('hostedBy', 'username avatar')
      .populate('problems', 'title slug difficulty type tags');
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    res.json({ success: true, contest });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/contests/:id/register ──────────────────────────────────────────
router.post('/:id/register', protect, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    const alreadyRegistered = contest.participants.includes(req.user._id);
    if (alreadyRegistered)
      return res.status(400).json({ success: false, message: 'Already registered' });
    contest.participants.push(req.user._id);
    await contest.save();
    res.json({ success: true, message: 'Registered successfully', participants: contest.participants.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/contests ────────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const contest = await Contest.create({ ...req.body, hostedBy: req.user._id, isApproved: false });
    res.status(201).json({ success: true, message: 'Contest submitted for review', contest });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── GET /api/contests/:id/progress ───────────────────────────────────────────
// Returns the set of problem IDs the logged-in user has solved in this contest
router.get('/:id/progress', protect, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });

    const Submission = require('../models/Submission');
    const solved = await Submission.find({
      user: req.user._id,
      problem: { $in: contest.problems },
      contest: contest._id,
      verdict: 'Accepted',
    }).distinct('problem');

    res.json({ success: true, solvedProblemIds: solved.map(String) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/contests/:id/leaderboard ────────────────────────────────────────
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate('problems', '_id title slug');
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });

    const Submission = require('../models/Submission');
    const User = require('../models/User');

    // Get all accepted submissions for this contest
    const subs = await Submission.find({
      contest: contest._id,
      problem: { $in: contest.problems.map((p) => p._id) },
      verdict: 'Accepted',
    }).sort({ createdAt: 1 }); // earliest first for penalty calculation

    // Build per-user records
    const userMap = {}; // userId -> { solvedSet, penalty }
    const contestStart = new Date(contest.startTime).getTime();

    for (const sub of subs) {
      const uid = sub.user.toString();
      const pid = sub.problem.toString();
      if (!userMap[uid]) userMap[uid] = { solvedProblems: {}, totalPenalty: 0 };
      // Only count first accepted per problem
      if (!userMap[uid].solvedProblems[pid]) {
        const penalty = Math.floor((new Date(sub.createdAt).getTime() - contestStart) / 60000); // minutes
        userMap[uid].solvedProblems[pid] = penalty;
        userMap[uid].totalPenalty += penalty;
      }
    }

    if (Object.keys(userMap).length === 0) {
      return res.json({ success: true, leaderboard: [] });
    }

    // Fetch user info
    const users = await User.find({ _id: { $in: Object.keys(userMap) } })
      .select('username avatar');

    const leaderboard = users.map((u) => {
      const record = userMap[u._id.toString()];
      return {
        user: { _id: u._id, username: u.username, avatar: u.avatar },
        solved: Object.keys(record.solvedProblems).length,
        penalty: record.totalPenalty,
        solvedProblems: record.solvedProblems,
      };
    });

    // Sort: most solved desc, then least penalty asc
    leaderboard.sort((a, b) => b.solved - a.solved || a.penalty - b.penalty);

    res.json({ success: true, leaderboard, totalProblems: contest.problems.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
