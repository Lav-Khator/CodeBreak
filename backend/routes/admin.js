const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Contest    = require('../models/Contest');
const Problem    = require('../models/Problem');
const User       = require('../models/User');
const Submission = require('../models/Submission');

// ── Admin-only middleware ───────────────────────────────────────────────────
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

// Apply auth + admin check to all routes
router.use(protect, adminOnly);

// ─── GET /api/admin/stats ──────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [users, problems, contests, submissions] = await Promise.all([
      User.countDocuments(),
      Problem.countDocuments({ isApproved: true }),
      Contest.countDocuments({ isApproved: true }),
      Submission.countDocuments(),
    ]);
    res.json({ success: true, stats: { users, problems, contests, submissions } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/admin/pending-contests ──────────────────────────────────────
router.get('/pending-contests', async (req, res) => {
  try {
    const contests = await Contest.find({ isApproved: false })
      .populate('hostedBy', 'username')
      .sort({ createdAt: -1 });
    res.json({ success: true, contests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/admin/pending-problems ──────────────────────────────────────
router.get('/pending-problems', async (req, res) => {
  try {
    const problems = await Problem.find({ isApproved: false })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    res.json({ success: true, problems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/admin/all-problems ──────────────────────────────────────────
router.get('/all-problems', async (req, res) => {
  try {
    const problems = await Problem.find({ isApproved: true })
      .select('title slug type difficulty tags totalSubmissions acceptedSubmissions createdAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, problems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PATCH /api/admin/contests/:id/approve ────────────────────────────────
router.patch('/contests/:id/approve', async (req, res) => {
  try {
    const contest = await Contest.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    res.json({ success: true, contest });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/admin/contests/:id ──────────────────────────────────────
router.delete('/contests/:id', async (req, res) => {
  try {
    await Contest.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PATCH /api/admin/problems/:id/approve ────────────────────────────────
router.patch('/problems/:id/approve', async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    res.json({ success: true, problem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/admin/problems/:id ──────────────────────────────────────
router.delete('/problems/:id', async (req, res) => {
  try {
    await Problem.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
