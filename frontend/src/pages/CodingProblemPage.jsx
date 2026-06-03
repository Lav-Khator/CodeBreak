import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

/* ── Language config ──────────────────────────────────────────────────────────── */
const LANGUAGES = [
  { id: 'cpp', label: 'C++', monacoLang: 'cpp', icon: '⚙️' },
  { id: 'python', label: 'Python', monacoLang: 'python', icon: '🐍' },
  { id: 'java', label: 'Java', monacoLang: 'java', icon: '☕' },
  { id: 'javascript', label: 'JavaScript', monacoLang: 'javascript', icon: '🟨' },
];

/* ── Difficulty styling ───────────────────────────────────────────────────────── */
function diffStyle(d) {
  if (d === 'Easy') return 'text-emerald-400 border-emerald-700/50 bg-emerald-950/40';
  if (d === 'Medium') return 'text-amber-400 border-amber-700/50 bg-amber-950/40';
  return 'text-red-400 border-red-700/50 bg-red-950/40';
}

/* ── Verdict badge ────────────────────────────────────────────────────────────── */
function VerdictBadge({ verdict }) {
  if (!verdict) return null;
  const styles = {
    accepted: 'text-emerald-300 bg-emerald-950/60 border-emerald-600/40',
    wrong: 'text-red-300 bg-red-950/60 border-red-600/40',
    error: 'text-amber-300 bg-amber-950/60 border-amber-600/40',
    running: 'text-blue-300 bg-blue-950/60 border-blue-600/40',
  };
  const icons = { accepted: '✅', wrong: '❌', error: '⚠️', running: '⏳' };
  const labels = { accepted: 'Accepted', wrong: 'Wrong Answer', error: 'Runtime / Compile Error', running: 'Running…' };

  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold animate-fade-in ${styles[verdict]}`}>
      <span className="text-base">{icons[verdict]}</span>
      {labels[verdict]}
    </div>
  );
}

/* ── Problem description section ──────────────────────────────────────────────── */
function ProblemStatement({ problem }) {
  const [activeTab, setActiveTab] = useState('problem');

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-violet-900/30 flex-shrink-0">
        {[['problem', '📄 Problem'], ['examples', '💡 Examples'], ['constraints', '📏 Constraints']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-5 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
              activeTab === key
                ? 'text-violet-300 border-violet-500'
                : 'text-slate-400 hover:text-slate-300 border-transparent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {activeTab === 'problem' && (
          <div className="prose prose-invert prose-sm max-w-none">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${diffStyle(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
              {(problem.tags || []).map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-violet-950/60 border border-violet-800/30 text-violet-400">
                  {t}
                </span>
              ))}
            </div>

            <h2 className="text-xl font-black text-white mb-4">{problem.title}</h2>

            <div className="text-slate-300 leading-relaxed text-sm">
              <ReactMarkdown
                components={{
                  code: ({ children }) => (
                    <code className="bg-dark-500/80 border border-white/10 rounded px-1.5 py-0.5 text-violet-300 font-mono text-xs">
                      {children}
                    </code>
                  ),
                  strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                  em: ({ children }) => <em className="text-violet-300 not-italic font-medium">{children}</em>,
                  p: ({ children }) => <p className="mb-3 text-slate-300">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-slate-300 mb-3">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 text-slate-300 mb-3">{children}</ol>,
                  li: ({ children }) => <li className="text-slate-300">{children}</li>,
                }}
              >
                {problem.description}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="space-y-4">
            {(problem.examples || []).map((ex, i) => (
              <div key={i} className="bg-dark-700/50 rounded-xl border border-white/10 overflow-hidden">
                <div className="px-4 py-2 border-b border-white/10 bg-dark-600/40">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Example {i + 1}</span>
                </div>
                <div className="p-4 space-y-2">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Input</span>
                    <pre className="mt-1 text-sm text-emerald-300 font-mono bg-dark-800/60 rounded-lg p-2 whitespace-pre-wrap">{ex.input}</pre>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Output</span>
                    <pre className="mt-1 text-sm text-violet-300 font-mono bg-dark-800/60 rounded-lg p-2 whitespace-pre-wrap">{ex.output}</pre>
                  </div>
                  {ex.explanation && (
                    <div>
                      <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Explanation</span>
                      <p className="mt-1 text-sm text-slate-300 leading-relaxed">{ex.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'constraints' && (
          <div>
            <ul className="space-y-2">
              {(problem.constraints || []).map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-violet-400 mt-0.5 flex-shrink-0">▸</span>
                  <code className="text-slate-300 font-mono">{c}</code>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Coding Problem Page
══════════════════════════════════════════════════════════════════════════════ */
export default function CodingProblemPage({ user }) {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedLang, setSelectedLang] = useState('cpp');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verdict, setVerdict] = useState(null); // null | 'accepted' | 'wrong' | 'error' | 'running'
  const [verdictMsg, setVerdictMsg] = useState('');
  const [activeResultTab, setActiveResultTab] = useState('verdict');

  // Drag-to-resize
  const [leftWidth, setLeftWidth] = useState(45); // percent
  const isDragging = useRef(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const { data } = await axios.get(`/api/problems/${slug}`);
        setProblem(data.problem);
        // Set starter code for default language
        setCode(data.problem.starterCode?.cpp || '// Write your solution here\n');
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [slug]);

  // Change code when language changes
  useEffect(() => {
    if (!problem) return;
    setCode(problem.starterCode?.[selectedLang] || `// Write your ${selectedLang} solution here\n`);
    setVerdict(null);
  }, [selectedLang, problem]);

  // Drag resize handlers
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.min(Math.max(pct, 25), 75));
    };
    const handleMouseUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Submit handler (simulated — real execution engine comes later)
  const handleSubmit = async () => {
    if (!user) {
      setVerdict('error');
      setVerdictMsg('Please sign in to submit your solution.');
      return;
    }
    setSubmitting(true);
    setVerdict('running');
    setVerdictMsg('');

    // TODO: Replace with real /api/submit endpoint once Docker execution is ready
    await new Promise((r) => setTimeout(r, 2000));
    // Simulate random verdict for demo
    const demo = Math.random();
    if (demo > 0.4) {
      setVerdict('accepted');
      setVerdictMsg('All test cases passed!');
    } else if (demo > 0.2) {
      setVerdict('wrong');
      setVerdictMsg('Output did not match expected on test case 2.');
    } else {
      setVerdict('error');
      setVerdictMsg('Runtime Error: segmentation fault (core dumped)');
    }
    setSubmitting(false);
    setActiveResultTab('verdict');
  };

  // ── Loading / Not found ────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center pt-16">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading problem…</p>
        </div>
      </div>
    );
  }

  if (notFound || !problem) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center pt-16 px-4">
        <div className="glass rounded-2xl p-10 text-center border border-violet-900/20 max-w-sm">
          <p className="text-4xl mb-4">🔍</p>
          <h2 className="text-xl font-bold text-white mb-2">Problem Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">This problem doesn't exist or hasn't been approved yet.</p>
          <Link to="/problems" className="btn-primary px-6 py-2.5 rounded-xl text-white text-sm font-semibold inline-block">
            ← Back to Problems
          </Link>
        </div>
      </div>
    );
  }

  const currentLang = LANGUAGES.find((l) => l.id === selectedLang);

  return (
    <div className="h-screen bg-dark-900 flex flex-col pt-16 overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-violet-900/30 bg-dark-800/60 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/problems"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Problems
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-white font-semibold text-sm truncate max-w-xs">{problem.title}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${diffStyle(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {verdict && <VerdictBadge verdict={verdict} />}
        </div>
      </div>

      {/* ── Split pane ──────────────────────────────────────────────────── */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden select-none">

        {/* LEFT: Problem statement */}
        <div
          className="flex-shrink-0 overflow-hidden border-r border-violet-900/30 bg-dark-800/30"
          style={{ width: `${leftWidth}%` }}
        >
          <ProblemStatement problem={problem} />
        </div>

        {/* Drag handle */}
        <div
          onMouseDown={handleMouseDown}
          className="w-1.5 flex-shrink-0 bg-violet-900/20 hover:bg-violet-600/50 cursor-col-resize transition-colors duration-150 relative group"
        >
          <div className="absolute inset-y-0 -left-1 -right-1" /> {/* wider grab area */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full bg-violet-700/50 group-hover:bg-violet-400 transition-colors" />
        </div>

        {/* RIGHT: Editor */}
        <div className="flex-1 flex flex-col overflow-hidden bg-dark-900">

          {/* Editor toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-violet-900/30 bg-dark-800/60 flex-shrink-0">
            {/* Language selector */}
            <div className="flex gap-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  id={`lang-${lang.id}`}
                  onClick={() => setSelectedLang(lang.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    selectedLang === lang.id
                      ? 'bg-violet-600/30 text-violet-300 border border-violet-600/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span>{lang.icon}</span>
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCode(problem.starterCode?.[selectedLang] || '')}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
              >
                ↺ Reset
              </button>
              <button
                id="submit-solution"
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary flex items-center gap-2 px-5 py-1.5 rounded-lg text-white text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Running…
                  </>
                ) : (
                  <>▶ Submit</>
                )}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={currentLang?.monacoLang || 'cpp'}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                tabSize: 4,
                padding: { top: 16, bottom: 16 },
                bracketPairColorization: { enabled: true },
                formatOnPaste: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
              }}
              loading={
                <div className="flex items-center justify-center h-full bg-dark-900">
                  <div className="text-slate-500 text-sm flex items-center gap-2">
                    <div className="w-4 h-4 border border-violet-500 border-t-transparent rounded-full animate-spin" />
                    Loading editor…
                  </div>
                </div>
              }
            />
          </div>

          {/* Results panel */}
          {(verdict || submitting) && (
            <div className="flex-shrink-0 border-t border-violet-900/30 bg-dark-800/60 animate-slide-up" style={{ maxHeight: '180px', overflowY: 'auto' }}>
              <div className="flex border-b border-white/5">
                {[['verdict', 'Verdict'], ['output', 'Output']].map(([k, l]) => (
                  <button
                    key={k}
                    onClick={() => setActiveResultTab(k)}
                    className={`px-4 py-2 text-xs font-semibold transition-colors ${
                      activeResultTab === k ? 'text-violet-300 border-b border-violet-500' : 'text-slate-500'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <div className="p-4">
                {activeResultTab === 'verdict' && (
                  <div className="flex items-center gap-3">
                    <VerdictBadge verdict={submitting ? 'running' : verdict} />
                    {verdictMsg && <p className="text-sm text-slate-300">{verdictMsg}</p>}
                  </div>
                )}
                {activeResultTab === 'output' && (
                  <pre className="text-xs text-slate-300 font-mono">
                    {verdict === 'accepted' ? 'All hidden test cases passed ✓' : verdictMsg || 'No output yet'}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
