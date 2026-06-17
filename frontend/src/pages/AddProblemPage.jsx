import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

/* ── Reusable input components ────────────────────────────────────────────── */
function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-dark-700/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition";
const textareaCls = `${inputCls} resize-none`;

/* ── Dynamic list editor (constraints, tags) ──────────────────────────────── */
function ListEditor({ items, onChange, placeholder }) {
  const add    = () => onChange([...items, '']);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, v) => onChange(items.map((x, idx) => idx === i ? v : x));

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input value={item} onChange={(e) => update(i, e.target.value)} placeholder={placeholder}
            className={inputCls + ' flex-1'} />
          <button type="button" onClick={() => remove(i)}
            className="px-3 py-2 rounded-xl border border-red-700/40 text-red-400 hover:bg-red-950/30 text-sm transition">✕</button>
        </div>
      ))}
      <button type="button" onClick={add}
        className="text-xs text-violet-400 hover:text-violet-300 border border-violet-800/30 rounded-lg px-3 py-1.5 hover:bg-violet-950/30 transition">
        + Add
      </button>
    </div>
  );
}

/* ── Example editor ───────────────────────────────────────────────────────── */
function ExamplesEditor({ examples, onChange }) {
  const add    = () => onChange([...examples, { input: '', output: '', explanation: '' }]);
  const remove = (i) => onChange(examples.filter((_, idx) => idx !== i));
  const update = (i, field, v) => onChange(examples.map((ex, idx) => idx === i ? { ...ex, [field]: v } : ex));

  return (
    <div className="space-y-4">
      {examples.map((ex, i) => (
        <div key={i} className="glass rounded-xl border border-violet-900/20 p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Example {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-300 transition">Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Input</p>
              <textarea rows={3} value={ex.input} onChange={(e) => update(i, 'input', e.target.value)}
                placeholder="Input" className={textareaCls} />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Output</p>
              <textarea rows={3} value={ex.output} onChange={(e) => update(i, 'output', e.target.value)}
                placeholder="Output" className={textareaCls} />
            </div>
          </div>
          <input value={ex.explanation} onChange={(e) => update(i, 'explanation', e.target.value)}
            placeholder="Explanation (optional)" className={inputCls} />
        </div>
      ))}
      <button type="button" onClick={add}
        className="text-xs text-violet-400 hover:text-violet-300 border border-violet-800/30 rounded-lg px-3 py-1.5 hover:bg-violet-950/30 transition">
        + Add Example
      </button>
    </div>
  );
}

/* ── Test case editor ─────────────────────────────────────────────────────── */
function TestCasesEditor({ cases, onChange }) {
  const add    = () => onChange([...cases, { input: '', expectedOutput: '', isHidden: true }]);
  const remove = (i) => onChange(cases.filter((_, idx) => idx !== i));
  const update = (i, field, v) => onChange(cases.map((c, idx) => idx === i ? { ...c, [field]: v } : c));

  return (
    <div className="space-y-3">
      {cases.map((tc, i) => (
        <div key={i} className="glass rounded-xl border border-violet-900/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Test {i + 1}</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                <input type="checkbox" checked={tc.isHidden} onChange={(e) => update(i, 'isHidden', e.target.checked)}
                  className="accent-violet-500" />
                Hidden
              </label>
              <button type="button" onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-300 transition">Remove</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Input</p>
              <textarea rows={3} value={tc.input} onChange={(e) => update(i, 'input', e.target.value)}
                placeholder="Input" className={textareaCls} />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Expected Output</p>
              <textarea rows={3} value={tc.expectedOutput} onChange={(e) => update(i, 'expectedOutput', e.target.value)}
                placeholder="Expected output" className={textareaCls} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={add}
        className="text-xs text-violet-400 hover:text-violet-300 border border-violet-800/30 rounded-lg px-3 py-1.5 hover:bg-violet-950/30 transition">
        + Add Test Case
      </button>
    </div>
  );
}

/* ── Starter code tabs ────────────────────────────────────────────────────── */
const LANGS = ['cpp', 'python', 'java', 'javascript'];
const LANG_LABEL = { cpp: 'C++', python: 'Python', java: 'Java', javascript: 'JS' };

function StarterCodeEditor({ code, onChange }) {
  const [activeLang, setActiveLang] = useState('cpp');
  return (
    <div>
      <div className="flex gap-1 mb-2">
        {LANGS.map((l) => (
          <button key={l} type="button" onClick={() => setActiveLang(l)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeLang === l ? 'bg-violet-600/30 text-violet-300 border border-violet-600/40' : 'text-slate-400 hover:text-white border border-transparent'}`}>
            {LANG_LABEL[l]}
          </button>
        ))}
      </div>
      <textarea rows={8} value={code[activeLang] || ''} onChange={(e) => onChange({ ...code, [activeLang]: e.target.value })}
        placeholder={`// Starter code for ${LANG_LABEL[activeLang]}`}
        className={textareaCls + ' font-mono text-xs'} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Add Problem Page
══════════════════════════════════════════════════════════════════════════════ */
export default function AddProblemPage({ user }) {
  const navigate = useNavigate();
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;

  // Core fields
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty]   = useState('Easy');
  const [type, setType]               = useState('coding');
  const [tags, setTags]               = useState([]);
  const [constraints, setConstraints] = useState([]);
  const [examples, setExamples]       = useState([{ input: '', output: '', explanation: '' }]);
  const [testCases, setTestCases]     = useState([{ input: '', expectedOutput: '', isHidden: true }]);
  const [starterCode, setStarterCode] = useState({ cpp: '', python: '', java: '', javascript: '' });

  // Break-the-code fields
  const [buggyCode, setBuggyCode]           = useState('');
  const [buggyLanguage, setBuggyLanguage]   = useState('cpp');
  const [correctCode, setCorrectCode]       = useState('');
  const [correctLanguage, setCorrectLanguage] = useState('cpp');
  const [bugCategory, setBugCategory]       = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  const [tagInput, setTagInput] = useState('');
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title || !description) { setError('Title and description are required.'); return; }

    setSubmitting(true);
    try {
      const payload = {
        title, description, difficulty, type, tags,
        constraints: constraints.filter(Boolean),
        examples:    examples.filter((e) => e.input && e.output),
        testCases:   testCases.filter((t) => t.input && t.expectedOutput),
        starterCode,
        ...(type === 'break-the-code' && { buggyCode, buggyLanguage, correctCode, correctLanguage, bugCategory }),
      };
      await axios.post('/api/problems', payload);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create problem.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 bg-grid pt-20">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-96 h-96 bg-violet-700" style={{ top: '-5%', left: '-5%', opacity: 0.15 }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/admin" className="text-slate-400 hover:text-white text-sm transition">← Admin</Link>
          <span className="text-slate-600">/</span>
          <h1 className="text-2xl font-black text-white">Add Problem</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Basic Info ──────────────────────────────────────────────── */}
          <div className="glass rounded-2xl border border-violet-900/20 p-6 space-y-5">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Basic Info</h2>

            <Field label="Title" required>
              <input id="prob-title" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Two Sum" className={inputCls} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Difficulty" required>
                <select id="prob-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={inputCls}>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </Field>
              <Field label="Type" required>
                <select id="prob-type" value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
                  <option value="coding">⚔ Coding</option>
                  <option value="break-the-code">💥 Break the Code</option>
                </select>
              </Field>
            </div>

            <Field label="Description" required>
              <textarea id="prob-description" rows={6} value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Full problem description…" className={textareaCls} />
            </Field>

            <Field label="Tags">
              <div className="flex gap-1.5 flex-wrap mb-2">
                {tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-violet-950/60 border border-violet-700/40 text-violet-300 font-semibold">
                    {t}
                    <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}
                      className="text-violet-500 hover:text-white ml-0.5">✕</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="Type tag, press Enter" className={inputCls + ' flex-1'} />
                <button type="button" onClick={addTag}
                  className="px-4 py-2.5 rounded-xl border border-violet-700/40 text-violet-400 text-sm hover:bg-violet-950/40 transition">Add</button>
              </div>
            </Field>

            <Field label="Constraints">
              <ListEditor items={constraints} onChange={setConstraints} placeholder="e.g. 1 ≤ n ≤ 10⁴" />
            </Field>
          </div>

          {/* ── Examples ────────────────────────────────────────────────── */}
          <div className="glass rounded-2xl border border-violet-900/20 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Sample Examples</h2>
            <ExamplesEditor examples={examples} onChange={setExamples} />
          </div>

          {/* ── Test Cases ──────────────────────────────────────────────── */}
          <div className="glass rounded-2xl border border-violet-900/20 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Test Cases</h2>
              <span className="text-xs text-slate-500">Hidden = not shown to user</span>
            </div>
            <TestCasesEditor cases={testCases} onChange={setTestCases} />
          </div>

          {/* ── Coding: Starter Code ────────────────────────────────────── */}
          {type === 'coding' && (
            <div className="glass rounded-2xl border border-violet-900/20 p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Starter Code</h2>
              <StarterCodeEditor code={starterCode} onChange={setStarterCode} />
            </div>
          )}

          {/* ── Break-the-Code fields ────────────────────────────────────── */}
          {type === 'break-the-code' && (
            <div className="glass rounded-2xl border border-rose-900/20 p-6 space-y-5 border">
              <h2 className="text-sm font-bold text-rose-400 uppercase tracking-wider">💥 Break the Code Fields</h2>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Buggy Code Language">
                  <select value={buggyLanguage} onChange={(e) => setBuggyLanguage(e.target.value)} className={inputCls}>
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                </Field>
                <Field label="Correct Code Language">
                  <select value={correctLanguage} onChange={(e) => setCorrectLanguage(e.target.value)} className={inputCls}>
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                </Field>
              </div>

              <Field label="Buggy Code (shown to user)" required>
                <textarea id="buggy-code" rows={10} value={buggyCode} onChange={(e) => setBuggyCode(e.target.value)}
                  placeholder="// Paste the buggy code here…" className={textareaCls + ' font-mono text-xs'} />
              </Field>

              <Field label="Correct Code (hidden reference solution)" required>
                <textarea id="correct-code" rows={10} value={correctCode} onChange={(e) => setCorrectCode(e.target.value)}
                  placeholder="// Paste the correct reference solution here…" className={textareaCls + ' font-mono text-xs'} />
              </Field>

              <Field label="Bug Category (optional hint)">
                <input value={bugCategory} onChange={(e) => setBugCategory(e.target.value)}
                  placeholder="e.g. Off-by-one error, Integer overflow…" className={inputCls} />
              </Field>
            </div>
          )}

          {/* ── Error + Submit ───────────────────────────────────────────── */}
          {error && (
            <div className="bg-red-950/40 border border-red-700/40 rounded-xl px-4 py-3 text-sm text-red-300">{error}</div>
          )}

          <div className="flex gap-3">
            <Link to="/admin"
              className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white font-semibold text-sm transition text-center">
              Cancel
            </Link>
            <button id="submit-problem" type="submit" disabled={submitting}
              className="flex-1 btn-primary py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50">
              {submitting ? 'Creating…' : '✓ Create Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
