const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ─── GET /api/problems ─────────────────────────────────────────────────────────
// Query params: type, difficulty, tag, search, page, limit
router.get('/', async (req, res) => {
  try {
    const { type, difficulty, tag, search, page = 1, limit = 50 } = req.query;
    const filter = { isApproved: true };

    if (type && type !== 'all') filter.type = type;
    if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
    if (tag) filter.tags = { $in: [tag] };
    if (search) filter.title = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [problems, total] = await Promise.all([
      Problem.find(filter)
        .select('title slug type difficulty tags totalSubmissions acceptedSubmissions isProblemOfDay createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Problem.countDocuments(filter),
    ]);

    res.json({
      success: true,
      problems,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/problems/daily ───────────────────────────────────────────────────
router.get('/daily', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let problem = await Problem.findOne({
      isProblemOfDay: true,
      problemOfDayDate: { $gte: today, $lt: tomorrow },
    }).select('-testCases');

    // fallback: random approved problem
    if (!problem) {
      const count = await Problem.countDocuments({ isApproved: true });
      const skip = Math.floor(Math.random() * count);
      problem = await Problem.findOne({ isApproved: true }).skip(skip).select('-testCases');
    }

    res.json({ success: true, problem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/problems/:slug ───────────────────────────────────────────────────
router.get('/:slug', async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug, isApproved: true })
      .select('-testCases'); // hide test cases from client
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    res.json({ success: true, problem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/problems ────────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const problem = await Problem.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, problem });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
