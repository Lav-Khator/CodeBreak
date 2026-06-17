import { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import axios from 'axios';

/* ── Tag pill ─────────────────────────────────────────────────────────────── */
function TagPill({ tag, onRemove }) {
  return (
    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-violet-950/60 border border-violet-700/40 text-violet-300 font-semibold">
      {tag}
      <button onClick={() => onRemove(tag)} className="text-violet-500 hover:text-white transition-colors leading-none">✕</button>
    </span>
  );
}

/* ── Problem search row ───────────────────────────────────────────────────── */
function ProblemRow({ problem, isAdded, onAdd, onRemove }) {
  const diffColor = {
    Easy:   'text-emerald-400 border-emerald-700/40 bg-emerald-950/40',
    Medium: 'text-amber-400 border-amber-700/40 bg-amber-950/40',
    Hard:   'text-red-400 border-red-700/40 bg-red-950/40',
  }[problem.difficulty] || 'text-slate-400';

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${isAdded ? 'border-violet-600/40 bg-violet-950/20' : 'border-white/5 bg-white/3 hover:border-white/10'}`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{problem.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs px-1.5 py-0.5 rounded border ${diffColor}`}>{problem.difficulty}</span>
          <span className="text-xs text-slate-500 capitalize">{problem.type}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => isAdded ? onRemove(problem._id) : onAdd(problem)}
        className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
          isAdded
            ? 'bg-red-950/40 border border-red-700/40 text-red-400 hover:bg-red-950/60'
            : 'bg-violet-600/20 border border-violet-600/40 text-violet-300 hover:bg-violet-600/30'
        }`}
      >
        {isAdded ? '− Remove' : '+ Add'}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Host a Contest Page
══════════════════════════════════════════════════════════════════════════════ */
export default function HostContestPage({ user }) {
  const navigate = useNavigate();

  // Redirect if not logged in
  if (!user) return <Navigate to="/auth" replace />;

  const [step, setStep]           = useState(1); // 1=details, 2=problems, 3=review
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');

  // Form fields
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate]   = useState('');
  const [startTime, setStartTime]   = useState('');
  const [durationHours, setDurH]    = useState('2');
  const [durationMins, setDurM]     = useState('0');
  const [tags, setTags]             = useState([]);
  const [tagInput, setTagInput]     = useState('');

  // Problems
  const [allProblems, setAllProblems] = useState([]);
  const [search, setSearch]           = useState('');
  const [selectedProblems, setSelectedProblems] = useState([]);

  useEffect(() => {
    axios.get('/api/problems?limit=100')
      .then(({ data }) => setAllProblems(data.problems || []))
      .catch(() => {});
  }, []);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const startDateTime = startDate && startTime
    ? new Date(`${startDate}T${startTime}`)
    : null;
  const endDateTime = startDateTime
    ? new Date(startDateTime.getTime() + (parseInt(durationHours) * 60 + parseInt(durationMins)) * 60000)
    : null;

  const filteredProblems = allProblems.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await axios.post('/api/contests', {
        title,
        description,
        startTime: startDateTime,
        endTime: endDateTime,
        problems: selectedProblems.map((p) => p._id),
        tags,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Success screen ──────────────────────────────────────────────────────── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-dark-900 bg-grid flex items-center justify-center pt-16">
        <div className="glass rounded-3xl p-14 text-center border border-violet-900/20 max-w-md">
          <p className="text-6xl mb-4">🎉</p>
          <h2 className="text-2xl font-black text-white mb-3">Contest Submitted!</h2>
          <p className="text-slate-400 text-sm mb-6">
            Your contest has been submitted for admin review. Once approved it will appear on the Contests page.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/contests" className="btn-primary px-6 py-2.5 rounded-xl text-white text-sm font-bold">
              View Contests
            </Link>
            <button
              onClick={() => { setSubmitted(false); setStep(1); setTitle(''); setDescription(''); setSelectedProblems([]); setTags([]); }}
              className="px-6 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm font-semibold transition-colors"
            >
              Host Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Step indicator ──────────────────────────────────────────────────────── */
  const steps = ['Contest Details', 'Add Problems', 'Review & Submit'];

  return (
    <div className="min-h-screen bg-dark-900 bg-grid pt-20">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-96 h-96 bg-violet-700" style={{ top: '-5%', left: '-5%', opacity: 0.2 }} />
        <div className="orb w-64 h-64 bg-blue-700"   style={{ bottom: '10%', right: '-5%', opacity: 0.15 }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1">Host a Contest</h1>
          <p className="text-slate-400 text-sm">Fill in the details below and submit for admin review.</p>
        </div>

        {/* Step bar */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((label, i) => {
            const idx = i + 1;
            const done = step > idx;
            const active = step === idx;
            return (
              <div key={idx} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 transition-all ${
                  done   ? 'bg-emerald-600 text-white' :
                  active ? 'bg-violet-600 text-white ring-2 ring-violet-400/40' :
                           'bg-white/10 text-slate-500'
                }`}>
                  {done ? '✓' : idx}
                </div>
                <span className={`text-xs font-semibold hidden sm:block ${active ? 'text-white' : done ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {label}
                </span>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-2 ${step > idx ? 'bg-emerald-600/50' : 'bg-white/10'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="glass rounded-2xl border border-violet-900/20 p-6">

          {/* ── STEP 1: Details ────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-white mb-4">Contest Details</h2>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Contest Title *
                </label>
                <input
                  id="contest-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekly Challenge #10"
                  className="w-full bg-dark-700/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  id="contest-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What's this contest about?"
                  className="w-full bg-dark-700/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition resize-none"
                />
              </div>

              {/* Start date & time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Start Date *
                  </label>
                  <input
                    id="contest-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-dark-700/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Start Time *
                  </label>
                  <input
                    id="contest-start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-dark-700/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Duration
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      id="contest-duration-hours"
                      type="number" min="0" max="24"
                      value={durationHours}
                      onChange={(e) => setDurH(e.target.value)}
                      className="w-20 bg-dark-700/60 border border-white/10 rounded-xl px-3 py-3 text-white text-sm text-center focus:outline-none focus:border-violet-500/50 transition"
                    />
                    <span className="text-slate-400 text-sm">hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="contest-duration-mins"
                      type="number" min="0" max="59"
                      value={durationMins}
                      onChange={(e) => setDurM(e.target.value)}
                      className="w-20 bg-dark-700/60 border border-white/10 rounded-xl px-3 py-3 text-white text-sm text-center focus:outline-none focus:border-violet-500/50 transition"
                    />
                    <span className="text-slate-400 text-sm">minutes</span>
                  </div>
                  {endDateTime && (
                    <span className="text-xs text-slate-500">
                      Ends: {endDateTime.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Tags
                </label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {tags.map((t) => <TagPill key={t} tag={t} onRemove={(tag) => setTags(tags.filter((x) => x !== tag))} />)}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="Add a tag (press Enter)"
                    className="flex-1 bg-dark-700/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition"
                  />
                  <button type="button" onClick={addTag} className="px-4 py-2.5 rounded-xl border border-violet-700/40 text-violet-400 text-sm hover:bg-violet-950/40 transition">
                    Add
                  </button>
                </div>
              </div>

              <button
                id="step1-next"
                type="button"
                onClick={() => setStep(2)}
                disabled={!title || !startDate || !startTime}
                className="w-full btn-primary py-3 rounded-xl text-white font-bold mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next: Add Problems →
              </button>
            </div>
          )}

          {/* ── STEP 2: Problems ───────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-white">Add Problems</h2>
                <span className="text-xs text-slate-400">{selectedProblems.length} selected</span>
              </div>

              {/* Selected problems */}
              {selectedProblems.length > 0 && (
                <div className="space-y-2 mb-2">
                  <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Selected</p>
                  {selectedProblems.map((p, i) => (
                    <div key={p._id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-violet-950/30 border border-violet-700/30">
                      <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                      <span className="flex-1 text-sm text-white truncate">{p.title}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedProblems(selectedProblems.filter((x) => x._id !== p._id))}
                        className="text-slate-500 hover:text-red-400 transition text-xs"
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search */}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search problems…"
                className="w-full bg-dark-700/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition"
              />

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredProblems.map((p) => (
                  <ProblemRow
                    key={p._id}
                    problem={p}
                    isAdded={selectedProblems.some((x) => x._id === p._id)}
                    onAdd={(prob) => setSelectedProblems([...selectedProblems, prob])}
                    onRemove={(id) => setSelectedProblems(selectedProblems.filter((x) => x._id !== id))}
                  />
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white font-semibold text-sm transition">
                  ← Back
                </button>
                <button
                  id="step2-next"
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={selectedProblems.length === 0}
                  className="flex-1 btn-primary py-3 rounded-xl text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Review →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Review ─────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-white mb-2">Review & Submit</h2>

              <div className="space-y-3">
                <ReviewRow label="Title"       value={title} />
                <ReviewRow label="Description" value={description || '—'} />
                <ReviewRow label="Start"       value={startDateTime?.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
                <ReviewRow label="End"         value={endDateTime?.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
                <ReviewRow label="Duration"    value={`${durationHours}h ${durationMins}m`} />
                <ReviewRow label="Tags"        value={tags.join(', ') || '—'} />
                <div className="flex gap-3 py-3 border-t border-white/5">
                  <span className="text-xs text-slate-500 uppercase tracking-wider w-24 flex-shrink-0">Problems</span>
                  <div className="space-y-1 flex-1">
                    {selectedProblems.map((p, i) => (
                      <p key={p._id} className="text-sm text-white">{i + 1}. {p.title} <span className="text-slate-500">({p.difficulty})</span></p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-amber-950/20 border border-amber-700/30 rounded-xl px-4 py-3 text-sm text-amber-300">
                ⚠️ After submission, an admin will review your contest before it goes live.
              </div>

              {error && (
                <div className="bg-red-950/40 border border-red-700/40 rounded-xl px-4 py-3 text-sm text-red-300">{error}</div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white font-semibold text-sm transition">
                  ← Back
                </button>
                <button
                  id="submit-contest"
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 btn-primary py-3 rounded-xl text-white font-bold disabled:opacity-60"
                >
                  {submitting ? 'Submitting…' : '🚀 Submit Contest'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex gap-3 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-slate-500 uppercase tracking-wider w-24 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-white flex-1">{value}</span>
    </div>
  );
}
