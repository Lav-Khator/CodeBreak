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

module.exports = router;
