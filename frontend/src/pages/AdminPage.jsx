import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';

/* ── Diff badge ───────────────────────────────────────────────────────────── */
function DiffBadge({ d }) {
  const cls = d === 'Easy'   ? 'text-emerald-400 border-emerald-700/40 bg-emerald-950/30'
            : d === 'Medium' ? 'text-amber-400 border-amber-700/40 bg-amber-950/30'
            :                  'text-red-400 border-red-700/40 bg-red-950/30';
  return <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${cls}`}>{d}</span>;
}

/* ── Pending section ──────────────────────────────────────────────────────── */
function PendingSection({ title, icon, items, type, onApprove, onReject }) {
  if (items.length === 0) return (
    <div className="glass rounded-2xl border border-violet-900/20 p-6">
      <h2 className="text-base font-bold text-white mb-4">{icon} {title}</h2>
      <p className="text-slate-500 text-sm text-center py-6">No pending {type}s for review.</p>
    </div>
  );
  return (
    <div className="glass rounded-2xl border border-violet-900/20 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-base font-bold text-white">{icon} {title}</h2>
        <span className="text-xs px-2 py-1 rounded-full bg-amber-950/50 border border-amber-700/40 text-amber-400 font-bold">
          {items.length} pending
        </span>
      </div>
      <div className="divide-y divide-white/5">
        {items.map((item) => (
          <div key={item._id} className="flex items-start gap-4 px-5 py-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{item.title}</p>
              {item.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.description}</p>}
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {item.difficulty && <DiffBadge d={item.difficulty} />}
                {item.type && <span className="text-xs text-slate-500 capitalize">{item.type}</span>}
                {item.startTime && <span className="text-xs text-slate-500">Starts: {new Date(item.startTime).toLocaleDateString()}</span>}
                {item.hostedBy && <span className="text-xs text-violet-400">by @{item.hostedBy.username}</span>}
                {item.createdBy && <span className="text-xs text-violet-400">by @{item.createdBy.username}</span>}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => onApprove(item._id)}
                className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-700/40 text-emerald-400 text-xs font-bold hover:bg-emerald-950/60 transition">
                ✓ Approve
              </button>
              <button onClick={() => onReject(item._id)}
                className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-700/40 text-red-400 text-xs font-bold hover:bg-red-950/60 transition">
                ✕ Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Admin Panel
════════════════════════════════════════════════════════════════════════════ */
export default function AdminPage({ user }) {
  if (!user)               return <Navigate to="/auth" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;

  const [tab, setTab] = useState('review'); // review | problems
  const [pendingContests, setPendingContests] = useState([]);
  const [pendingProblems, setPendingProblems] = useState([]);
  const [allProblems, setAllProblems]         = useState([]);
  const [stats, setStats]                     = useState({});
  const [loading, setLoading]                 = useState(true);
  const [deleting, setDeleting]               = useState(null);
  const [probSearch, setProbSearch]           = useState('');

  const load = async () => {
    try {
      const [cRes, pRes, sRes, aRes] = await Promise.all([
        axios.get('/api/admin/pending-contests'),
        axios.get('/api/admin/pending-problems'),
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/all-problems'),
      ]);
      setPendingContests(cRes.data.contests || []);
      setPendingProblems(pRes.data.problems || []);
      setStats(sRes.data.stats || {});
      setAllProblems(aRes.data.problems || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const approveContest = async (id) => { await axios.patch(`/api/admin/contests/${id}/approve`); setPendingContests((c) => c.filter((x) => x._id !== id)); };
  const rejectContest  = async (id) => { await axios.delete(`/api/admin/contests/${id}`);         setPendingContests((c) => c.filter((x) => x._id !== id)); };
  const approveProblem = async (id) => { await axios.patch(`/api/admin/problems/${id}/approve`); setPendingProblems((p) => p.filter((x) => x._id !== id)); };
  const rejectProblem  = async (id) => { await axios.delete(`/api/admin/problems/${id}`);        setPendingProblems((p) => p.filter((x) => x._id !== id)); };

  const deleteProblem = async (id) => {
    if (!window.confirm('Delete this problem permanently?')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/admin/problems/${id}`);
      setAllProblems((p) => p.filter((x) => x._id !== id));
    } catch {}
    finally { setDeleting(null); }
  };

  const filteredProblems = allProblems.filter((p) =>
    p.title.toLowerCase().includes(probSearch.toLowerCase())
  );

  const pendingTotal = pendingContests.length + pendingProblems.length;

  return (
    <div className="min-h-screen bg-dark-900 bg-grid pt-20">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-96 h-96 bg-amber-700" style={{ top: '-5%', right: '-5%', opacity: 0.1 }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">🛡</span>
              <h1 className="text-3xl font-black text-white">Admin Panel</h1>
            </div>
            <p className="text-slate-400 text-sm">Manage problems, contests, and users.</p>
          </div>
          <Link to="/admin/add-problem"
            className="btn-primary px-5 py-2.5 rounded-xl text-white text-sm font-bold flex items-center gap-2">
            + Add Problem
          </Link>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Total Users',    value: stats.users    ?? 0 },
              { label: 'Total Problems', value: stats.problems ?? 0 },
              { label: 'Total Contests', value: stats.contests ?? 0 },
              { label: 'Submissions',    value: stats.submissions ?? 0 },
            ].map(({ label, value }) => (
              <div key={label} className="glass rounded-xl p-4 border border-violet-900/20 text-center">
                <p className="text-2xl font-black text-violet-300">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab bar */}
        <div className="flex glass rounded-xl p-1 border border-violet-900/20 mb-6 w-fit">
          {[
            ['review',   `⏳ Pending Review${pendingTotal > 0 ? ` (${pendingTotal})` : ''}`],
            ['problems', `📋 Problems (${allProblems.length})`],
          ].map(([key, label]) => (
            <button key={key} id={`admin-tab-${key}`} onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === key ? 'bg-violet-600/30 text-violet-300 border border-violet-600/40' : 'text-slate-400 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Review Tab ─────────────────────────────────────────────── */}
            {tab === 'review' && (
              <div className="space-y-6">
                <PendingSection title="Pending Contests" icon="🏆" items={pendingContests} type="contest"
                  onApprove={approveContest} onReject={rejectContest} />
                <PendingSection title="Pending Problems" icon="📋" items={pendingProblems} type="problem"
                  onApprove={approveProblem} onReject={rejectProblem} />
              </div>
            )}

            {/* ── Problems Tab ────────────────────────────────────────────── */}
            {tab === 'problems' && (
              <div className="glass rounded-2xl border border-violet-900/20 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 gap-3 flex-wrap">
                  <h2 className="text-sm font-bold text-white">All Problems</h2>
                  <input
                    type="text"
                    value={probSearch}
                    onChange={(e) => setProbSearch(e.target.value)}
                    placeholder="Search…"
                    className="bg-dark-700/60 border border-white/10 rounded-xl px-4 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition w-56"
                  />
                </div>

                {filteredProblems.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <p className="text-2xl mb-2">📭</p>
                    <p className="text-sm">No problems found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {filteredProblems.map((p) => (
                      <div key={p._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{p.title}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <DiffBadge d={p.difficulty} />
                            <span className={`text-xs px-1.5 py-0.5 rounded border ${p.type === 'coding' ? 'text-violet-400 border-violet-700/30 bg-violet-950/30' : 'text-rose-400 border-rose-700/30 bg-rose-950/30'}`}>
                              {p.type === 'coding' ? '⚔ Coding' : '💥 Break'}
                            </span>
                            <span className="text-xs text-slate-600">
                              {p.acceptedSubmissions ?? 0}/{p.totalSubmissions ?? 0} accepted
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link
                            to={p.type === 'break-the-code' ? `/break/${p.slug}` : `/problems/${p.slug}`}
                            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white transition"
                            target="_blank"
                          >
                            View ↗
                          </Link>
                          <button
                            onClick={() => deleteProblem(p._id)}
                            disabled={deleting === p._id}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-700/40 text-red-400 hover:bg-red-950/60 transition disabled:opacity-50 font-semibold"
                          >
                            {deleting === p._id ? '…' : '🗑 Delete'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
