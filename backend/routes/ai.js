const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');

function getModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set in .env');
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

// ─── POST /api/ai/hint ────────────────────────────────────────────────────────
// Returns a short hint for a problem. No code needed.
router.post('/hint', protect, async (req, res) => {
  const { title, description, constraints, examples } = req.body;
  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Problem info required' });
  }

  try {
    const model = getModel();

    const examplesText = (examples || []).slice(0, 2)
      .map((e, i) => `Example ${i + 1}:\n  Input: ${e.input}\n  Output: ${e.output}`)
      .join('\n');

    const constraintsText = (constraints || []).join('\n');

    const prompt = `You are a competitive programming mentor helping a student.
Give ONE short, directional hint (2-4 sentences) for the following problem.
Rules:
- Do NOT reveal the algorithm name or the solution.
- Do NOT write any code.
- Nudge the student toward the right approach by asking a guiding question or pointing out what to think about.
- Be encouraging.

Problem: ${title}
Description: ${description}
${constraintsText ? `Constraints:\n${constraintsText}` : ''}
${examplesText ? `Examples:\n${examplesText}` : ''}

Give only the hint, nothing else.`;

    const result = await model.generateContent(prompt);
    const hint = result.response.text().trim();

    res.json({ success: true, hint });
  } catch (err) {
    console.error('AI hint error:', err.message);
    if (err.message.includes('GEMINI_API_KEY')) {
      return res.status(503).json({ success: false, message: 'AI service not configured. Add GEMINI_API_KEY to backend/.env' });
    }
    res.status(500).json({ success: false, message: 'AI service error. Please try again.' });
  }
});

// ─── POST /api/ai/feedback ────────────────────────────────────────────────────
// Returns feedback on a submission. Called after WA / TLE / RE.
router.post('/feedback', protect, async (req, res) => {
  const { title, description, constraints, language, code, verdict, passedTests, totalTests, errorOutput } = req.body;
  if (!title || !code || !verdict) {
    return res.status(400).json({ success: false, message: 'Problem info, code and verdict required' });
  }

  try {
    const model = getModel();

    const constraintsText = (constraints || []).join('\n');
    const resultSummary = passedTests !== undefined
      ? `${passedTests}/${totalTests} test cases passed`
      : verdict;

    const errorInfo = errorOutput
      ? `\nError/Output info: ${errorOutput.slice(0, 500)}`
      : '';

    const prompt = `You are a competitive programming code reviewer.
A student got "${verdict}" (${resultSummary}) on the following problem.${errorInfo}

Rules:
- Do NOT give the correct solution or full corrected code.
- Give 2-4 sentences of actionable feedback pointing out likely issues in the code.
- Mention specific line patterns or logic errors you notice.
- If it's TLE, suggest what to optimize.
- If it's Runtime Error, suggest what might crash.
- If it's Wrong Answer, suggest what edge cases might be missing.
- Be specific and concise.

Problem: ${title}
${constraintsText ? `Constraints:\n${constraintsText}` : ''}

Student's ${language} code:
\`\`\`${language}
${code.slice(0, 3000)}
\`\`\`

Give only the feedback, nothing else.`;

    const result = await model.generateContent(prompt);
    const feedback = result.response.text().trim();

    res.json({ success: true, feedback });
  } catch (err) {
    console.error('AI feedback error:', err.message);
    if (err.message.includes('GEMINI_API_KEY')) {
      return res.status(503).json({ success: false, message: 'AI service not configured. Add GEMINI_API_KEY to backend/.env' });
    }
    res.status(500).json({ success: false, message: 'AI service error. Please try again.' });
  }
});

module.exports = router;
