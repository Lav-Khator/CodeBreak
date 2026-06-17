import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

/* ── Syntax-highlighted code block ───────────────────────────────────────── */
function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative group rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center justify-between px-4 py-2 bg-dark-700/80 border-b border-white/5">
        <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">{language}</span>
        <button onClick={copy} className="text-xs text-slate-500 hover:text-white transition-colors">
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm text-slate-300 font-mono leading-relaxed bg-dark-800/60 whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

/* ── Result banner ────────────────────────────────────────────────────────── */
function ResultBanner({ result, buggyOutput, correctOutput, message }) {
  const broken = result === 'Broken';
  return (
    <div className={`rounded-2xl border p-5 animate-fade-in ${broken ? 'bg-emerald-950/30 border-emerald-600/40' : 'bg-red-950/20 border-red-700/30'}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{broken ? '💥' : '✗'}</span>
        <p className={`font-bold text-base ${broken ? 'text-emerald-300' : 'text-red-300'}`}>
          {broken ? 'You Broke It!' : 'Not Broken'}
        </p>
      </div>
      <p className="text-sm text-slate-400 mb-4">{message}</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Buggy Output</p>
          <pre className={`text-xs font-mono p-3 rounded-lg bg-dark-800/60 border ${broken ? 'border-red-700/30 text-red-300' : 'border-white/5 text-slate-400'} whitespace-pre-wrap break-all`}>
            {buggyOutput || '(empty)'}
          </pre>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Correct Output</p>
          <pre className={`text-xs font-mono p-3 rounded-lg bg-dark-800/60 border ${broken ? 'border-emerald-700/30 text-emerald-300' : 'border-white/5 text-slate-400'} whitespace-pre-wrap break-all`}>
            {correctOutput || '(empty)'}
          </pre>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Break the Code Page
══════════════════════════════════════════════════════════════════════════════ */
export default function BreakTheCodePage({ user }) {
  const { slug } = useParams();
  const [problem, setProblem]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);

  const [input, setInput]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]       = useState(null); // null | response object
  const [history, setHistory]     = useState([]);
  const [activeTab, setActiveTab] = useState('problem'); // problem | history

  useEffect(() => {
    axios.get(`/api/problems/${slug}`)
      .then(({ data }) => {
        if (data.problem.type !== 'break-the-code') {
          setNotFound(true);
        } else {
          setProblem(data.problem);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!user || !problem) return;
    axios.get(`/api/break/${slug}/history`)
      .then(({ data }) => setHistory(data.submissions || []))
      .catch(() => {});
  }, [user, problem, slug]);

  const handleSubmit = async () => {
    if (!user) { alert('Please sign in to submit.'); return; }
    if (!input.trim()) return;
    setSubmitting(true);
    setResult(null);
    try {
      const { data } = await axios.post(`/api/break/${slug}`, { input });
      setResult(data);
      // Prepend to history
      setHistory((h) => [{
        _id: Date.now(),
        input,
        result: data.result,
        createdAt: new Date().toISOString(),
      }, ...h]);
    } catch (err) {
      setResult({ result: 'Error', message: err.response?.data?.message || 'Execution failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center pt-16">
      <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
    </div>
  );

  if (notFound || !problem) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center pt-16">
      <div className="glass rounded-2xl p-10 text-center border border-violet-900/20 max-w-sm">
        <p className="text-4xl mb-4">🔍</p>
        <h2 className="text-xl font-bold text-white mb-2">Problem Not Found</h2>
        <Link to="/problems" className="btn-primary px-6 py-2.5 rounded-xl text-white text-sm font-semibold inline-block mt-2">
          ← Back to Problems
        </Link>
      </div>
    </div>
  );

  const diffStyle = {
    Easy:   'text-emerald-400 bg-emerald-950/40 border-emerald-700/40',
    Medium: 'text-amber-400 bg-amber-950/40 border-amber-700/40',
    Hard:   'text-red-400 bg-red-950/40 border-red-700/40',
  }[problem.difficulty] || 'text-slate-400';

  return (
    <div className="min-h-screen bg-dark-900 pt-16">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-violet-900/30 bg-dark-800/60">
        <div className="flex items-center gap-3">
          <Link to="/problems" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Problems
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-white font-semibold text-sm truncate max-w-xs">{problem.title}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${diffStyle}`}>{problem.difficulty}</span>
          <span className="text-xs px-2 py-0.5 rounded-lg bg-rose-950/50 border border-rose-700/40 text-rose-400 font-bold">
            💥 Break the Code
          </span>
        </div>
        <div className="text-xs text-slate-500">
          {problem.acceptedSubmissions} / {problem.totalSubmissions} broken
        </div>
      </div>

      {/* Main layout: two columns */}
      <div className="flex h-[calc(100vh-8rem)] overflow-hidden">

        {/* LEFT: Problem info */}
        <div className="w-1/2 flex flex-col border-r border-violet-900/30 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-violet-900/30 flex-shrink-0">
            {[['problem', '📄 Problem'], ['history', `📜 History (${history.length})`]].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === key ? 'text-violet-300 border-violet-500' : 'text-slate-400 hover:text-slate-300 border-transparent'}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {activeTab === 'problem' && (
              <>
                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  {(problem.tags || []).map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-violet-950/60 border border-violet-800/30 text-violet-400">{t}</span>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-lg font-black text-white mb-3">{problem.title}</h2>
                  <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{problem.description}</div>
                </div>

                {/* Constraints */}
                {problem.constraints?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Constraints</h3>
                    <ul className="space-y-1">
                      {problem.constraints.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-violet-400 mt-0.5">▸</span>
                          <code className="text-slate-300 font-mono">{c}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Examples */}
                {problem.examples?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sample I/O</h3>
                    {problem.examples.map((ex, i) => (
                      <div key={i} className="bg-dark-700/40 rounded-xl border border-white/5 overflow-hidden mb-3">
                        <div className="px-3 py-1.5 border-b border-white/5 bg-dark-600/40">
                          <span className="text-xs font-bold text-slate-500 uppercase">Example {i + 1}</span>
                        </div>
                        <div className="p-3 space-y-2">
                          <div>
                            <span className="text-xs text-slate-500 font-semibold uppercase">Input</span>
                            <pre className="mt-1 text-xs text-emerald-300 font-mono bg-dark-800/60 rounded p-2 whitespace-pre-wrap">{ex.input}</pre>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 font-semibold uppercase">Buggy Output</span>
                            <pre className="mt-1 text-xs text-red-300 font-mono bg-dark-800/60 rounded p-2 whitespace-pre-wrap">{ex.output}</pre>
                          </div>
                          {ex.explanation && <p className="text-xs text-slate-400">{ex.explanation}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'history' && (
              <div className="space-y-2">
                {history.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    <p className="text-2xl mb-2">📭</p>
                    <p className="text-sm">No attempts yet</p>
                  </div>
                ) : history.map((s) => (
                  <div key={s._id} className={`rounded-xl border px-4 py-3 ${s.result === 'Broken' ? 'bg-emerald-950/20 border-emerald-700/30' : 'bg-dark-700/30 border-white/5'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${s.result === 'Broken' ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {s.result === 'Broken' ? '💥 Broken' : '✗ Not Broken'}
                      </span>
                      <span className="text-xs text-slate-600">{new Date(s.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap break-all line-clamp-2">{s.input}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Buggy code + input */}
        <div className="flex-1 flex flex-col overflow-hidden bg-dark-900">

          {/* Buggy code */}
          <div className="flex-shrink-0 border-b border-violet-900/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">🐛 Buggy Code</h3>
              <span className="text-xs px-2 py-0.5 rounded bg-rose-950/40 border border-rose-700/30 text-rose-400 font-mono">
                {problem.buggyLanguage || 'cpp'}
              </span>
            </div>
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              <CodeBlock code={problem.buggyCode || '// No buggy code provided'} language={problem.buggyLanguage || 'cpp'} />
            </div>
          </div>

          {/* Input + submit + result — all scrollable */}
          <div className="flex-1 flex flex-col p-4 overflow-y-auto gap-3 min-h-0">
            <h3 className="text-sm font-bold text-white flex-shrink-0">
              🎯 Your Breaking Input
              <span className="text-slate-500 font-normal ml-2 text-xs">Enter an input that makes the code produce wrong output</span>
            </h3>

            <textarea
              id="break-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Type your test input here...\n\nExample: edge cases, large values, special characters`}
              className="bg-dark-700/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition resize-none flex-shrink-0"
              rows={5}
            />

            <button
              id="submit-break"
              onClick={handleSubmit}
              disabled={submitting || !input.trim()}
              className="flex-shrink-0 btn-primary py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Testing…
                </>
              ) : '💥 Try to Break It'}
            </button>

            {/* Result — shows immediately below the button, no clipping */}
            {result && (
              <div className="flex-shrink-0">
                <ResultBanner
                  result={result.result}
                  buggyOutput={result.buggyOutput}
                  correctOutput={result.correctOutput}
                  message={result.message}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
