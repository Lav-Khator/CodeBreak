import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function formatDate(d) {
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function duration(start, end) {
  const ms = new Date(end) - new Date(start);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function timeUntil(dateStr) {
  const diff = new Date(dateStr) - Date.now();
  if (diff <= 0) return 'Now';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function statusOf(c) {
  const now = Date.now();
  if (new Date(c.startTime) > now) return 'upcoming';
  if (new Date(c.endTime) > now) return 'ongoing';
  return 'past';
}

const STATUS_STYLE = {
  upcoming: { badge: 'text-blue-300 bg-blue-950/50 border-blue-700/40', label: '🕐 Upcoming' },
  ongoing:  { badge: 'text-emerald-300 bg-emerald-950/50 border-emerald-700/40', label: '🔴 Live' },
  past:     { badge: 'text-slate-400 bg-slate-800/40 border-slate-700/40', label: '✓ Ended' },
};

/* ── Contest Card ─────────────────────────────────────────────────────────── */
function ContestCard({ contest, user, onRegister }) {
  const status  = statusOf(contest);
  const style   = STATUS_STYLE[status];
  const isReg   = user && contest.participants?.some(
    (p) => (typeof p === 'object' ? p._id : p) === user._id
  );
  const [loading, setLoading] = useState(false);

  const handleReg = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await axios.post(`/api/contests/${contest._id}/register`);
      onRegister(contest._id);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div className="glass rounded-2xl border border-violet-900/20 hover:border-violet-600/30 transition-all duration-300 group overflow-hidden">
      {/* Top accent bar */}
      <div className={`h-1 w-full ${status === 'ongoing' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : status === 'upcoming' ? 'bg-gradient-to-r from-violet-600 to-blue-500' : 'bg-slate-700'}`} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3 gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${style.badge} flex-shrink-0`}>
            {style.label}
          </span>
          <span className="text-xs text-slate-500 text-right">
            {status === 'upcoming' && `Starts in ${timeUntil(contest.startTime)}`}
            {status === 'ongoing'  && `Ends in ${timeUntil(contest.endTime)}`}
            {status === 'past'     && formatDate(contest.endTime)}
          </span>
        </div>

        {/* Title — always links to detail page */}
        <Link to={`/contests/${contest._id}`}>
          <h3 className="text-base font-bold text-white mb-1 group-hover:text-violet-300 transition-colors">
            {contest.title}
          </h3>
        </Link>
        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{contest.description}</p>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <span>⏱ {duration(contest.startTime, contest.endTime)}</span>
          <span>📋 {contest.problems?.length ?? 0} problems</span>
          <span>👥 {contest.participants?.length ?? 0} registered</span>
        </div>

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {(contest.tags || []).map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-violet-950/50 border border-violet-800/30 text-violet-400">
              {t}
            </span>
          ))}
        </div>

        {/* Action button */}
        {status === 'ongoing' ? (
          <Link
            to={`/contests/${contest._id}`}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold"
          >
            ▶ Enter Contest
          </Link>
        ) : status === 'upcoming' ? (
          <div className="flex gap-2">
            <button
              onClick={handleReg}
              disabled={isReg || loading || !user}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isReg
                  ? 'bg-emerald-950/40 border border-emerald-700/40 text-emerald-400 cursor-default'
                  : !user
                  ? 'bg-dark-700/40 border border-white/10 text-slate-500 cursor-not-allowed'
                  : 'btn-primary text-white'
              }`}
            >
              {loading ? '…' : isReg ? '✓ Registered' : !user ? 'Sign in to register' : 'Register'}
            </button>
            <Link
              to={`/contests/${contest._id}`}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-slate-400 hover:text-white hover:border-violet-700/50 transition-all"
            >
              View →
            </Link>
          </div>
        ) : (
          <Link
            to={`/contests/${contest._id}`}
            className="w-full flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-slate-400 hover:text-white hover:border-violet-700/50 transition-all"
          >
            View Results →
          </Link>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Contests Page
══════════════════════════════════════════════════════════════════════════════ */
export default function ContestsPage({ user }) {
  const [contests, setContests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('upcoming'); // upcoming | ongoing | past

  useEffect(() => {
    axios.get('/api/contests')
      .then(({ data }) => setContests(data.contests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRegister = (id) => {
    setContests((prev) =>
      prev.map((c) =>
        c._id === id
          ? { ...c, participants: [...(c.participants || []), { _id: user._id }] }
          : c
      )
    );
  };

  const tabs    = ['upcoming', 'ongoing', 'past'];
  const counts  = Object.fromEntries(tabs.map((t) => [t, contests.filter((c) => statusOf(c) === t).length]));
  const visible = contests.filter((c) => statusOf(c) === tab);

  return (
    <div className="min-h-screen bg-dark-900 bg-grid pt-20">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-96 h-96 bg-violet-700" style={{ top: '-5%', right: '-5%', opacity: 0.2 }} />
        <div className="orb w-64 h-64 bg-blue-700"   style={{ bottom: '10%', left: '-5%', opacity: 0.15 }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">Contests</h1>
            <p className="text-slate-400 text-sm">Compete, rank up, and earn ratings.</p>
          </div>
          {user && (
            <Link
              to="/host-contest"
              className="btn-primary px-5 py-2.5 rounded-xl text-white text-sm font-bold flex items-center gap-2"
            >
              🎯 Host a Contest
            </Link>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 glass rounded-xl p-1 border border-violet-900/20 mb-8 w-fit">
          {tabs.map((t) => (
            <button
              key={t}
              id={`contest-tab-${t}`}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize flex items-center gap-2 ${
                tab === t
                  ? 'bg-violet-600/30 text-violet-300 border border-violet-600/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
              {counts[t] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t ? 'bg-violet-500/30 text-violet-300' : 'bg-white/10 text-slate-400'}`}>
                  {counts[t]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map((i) => <div key={i} className="glass rounded-2xl h-64 border border-violet-900/20 animate-pulse" />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="glass rounded-2xl p-16 border border-violet-900/20 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-400">No {tab} contests right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map((c) => (
              <ContestCard key={c._id} contest={c} user={user} onRegister={handleRegister} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
