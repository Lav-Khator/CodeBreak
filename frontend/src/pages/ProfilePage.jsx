import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

/* ── Difficulty color ─────────────────────────────────────────────────────── */
function diffColor(d) {
  if (d === 'Easy')   return 'text-emerald-400 bg-emerald-950/40 border-emerald-700/40';
  if (d === 'Medium') return 'text-amber-400 bg-amber-950/40 border-amber-700/40';
  return 'text-red-400 bg-red-950/40 border-red-700/40';
}

/* ── Verdict color ──────────────────────────────────────────────── */
function verdictColor(v) {
  if (v === 'Accepted') return 'text-emerald-400';
  if (v === 'Wrong Answer') return 'text-red-400';
  if (v === 'Time Limit Exceeded') return 'text-amber-400';
  return 'text-slate-400';
}

/* ── Stat card ────────────────────────────────────────────────────────────── */
function Stat({ label, value, sub, color = 'text-violet-300' }) {
  return (
    <div className="glass rounded-xl p-4 border border-violet-900/20 text-center">
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
    </div>
  );
}

/* ── Streak calendar (last 30 days) ──────────────────────────────────────── */
function StreakCalendar({ submissions }) {
  const days = 30;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeDays = new Set(
    (submissions || [])
      .filter((s) => s.verdict === 'Accepted')
      .map((s) => {
        const d = new Date(s.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.toDateString();
      })
  );

  return (
    <div className="flex gap-1 flex-wrap">
      {[...Array(days)].map((_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (days - 1 - i));
        const active = activeDays.has(d.toDateString());
        return (
          <div
            key={i}
            title={d.toLocaleDateString()}
            className={`w-4 h-4 rounded-sm transition-colors ${active ? 'bg-violet-500' : 'bg-white/5'}`}
          />
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Profile Page
══════════════════════════════════════════════════════════════════════════════ */
export default function ProfilePage({ user: currentUser }) {
  const { username } = useParams();
  const [profile, setProfile]           = useState(null);
  const [submissions, setSubmissions]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [notFound, setNotFound]         = useState(false);
  const [subTab, setSubTab]             = useState('all'); // all | accepted

  // Use username from URL param, or fall back to logged-in user
  const targetUsername = username || currentUser?.username;

  useEffect(() => {
    if (!targetUsername) { setLoading(false); return; }

    Promise.all([
      axios.get(`/api/users/${targetUsername}`),
      axios.get(`/api/users/${targetUsername}/submissions`),
    ])
      .then(([profileRes, subRes]) => {
        setProfile(profileRes.data.user);
        setSubmissions(subRes.data.submissions || []);
      })
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [targetUsername]);

  if (!targetUsername) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center pt-16">
        <div className="glass rounded-2xl p-10 text-center border border-violet-900/20 max-w-sm">
          <p className="text-4xl mb-4">👤</p>
          <h2 className="text-xl font-bold text-white mb-2">Not Signed In</h2>
          <Link to="/auth" className="btn-primary px-6 py-2.5 rounded-xl text-white text-sm font-semibold inline-block mt-2">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center pt-16">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center pt-16">
        <div className="glass rounded-2xl p-10 text-center border border-violet-900/20 max-w-sm">
          <p className="text-4xl mb-4">🔍</p>
          <h2 className="text-xl font-bold text-white mb-2">User Not Found</h2>
        </div>
      </div>
    );
  }

  const accepted    = submissions.filter((s) => s.verdict === 'Accepted');
  const uniqueSolved = new Set(accepted.map((s) => s.problem?._id || s.problem)).size;
  const isOwn      = currentUser?._id === profile._id;

  const visibleSubs = subTab === 'accepted'
    ? submissions.filter((s) => s.verdict === 'Accepted')
    : submissions;

  return (
    <div className="min-h-screen bg-dark-900 bg-grid pt-20">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-96 h-96 bg-violet-700" style={{ top: '-5%', right: '-5%', opacity: 0.15 }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        {/* Profile header */}
        <div className="glass rounded-2xl border border-violet-900/20 p-6 mb-6">
          <div className="flex items-center gap-5 flex-wrap">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-900 flex items-center justify-center text-3xl font-black text-white overflow-hidden flex-shrink-0 border-2 border-violet-500/30">
              {profile.avatar
                ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                : profile.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-black text-white">{profile.username}</h1>
                {profile.role === 'admin' && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-amber-950/50 border border-amber-700/40 text-amber-400 font-semibold">Admin</span>
                )}
                {isOwn && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-violet-950/50 border border-violet-700/40 text-violet-400 font-semibold">You</span>
                )}
              </div>
              <p className="text-slate-500 text-sm">
                Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Stat label="Solver Rating"  value={profile.solverRating  ?? 1200} color="text-violet-300" />
          <Stat label="Breaker Rating" value={profile.breakerRating ?? 1200} color="text-rose-300" />
          <Stat label="Problems Solved" value={uniqueSolved} color="text-emerald-300" />
          <Stat label="Current Streak"  value={`${profile.streak ?? 0}🔥`} color="text-amber-300" />
        </div>

        {/* Activity calendar */}
        <div className="glass rounded-2xl border border-violet-900/20 p-5 mb-6">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Activity — Last 30 Days</h2>
          <StreakCalendar submissions={submissions} />
        </div>

        {/* Submission history */}
        <div className="glass rounded-2xl border border-violet-900/20 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-bold text-white">Submissions</h2>
            <div className="flex glass rounded-lg p-0.5 border border-violet-900/20">
              {[['all', 'All'], ['accepted', 'Accepted']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSubTab(key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    subTab === key ? 'bg-violet-600/30 text-violet-300' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {visibleSubs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-2xl mb-2">📭</p>
              <p className="text-sm">No submissions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {visibleSubs.slice(0, 50).map((s) => {
                const isBreak = s.kind === 'break';
                const problemHref = isBreak ? `/break/${s.problem?.slug}` : `/problems/${s.problem?.slug}`;
                const verdictLabel = isBreak
                  ? (s.result === 'Broken' ? '💥 Broken' : '✗ Not Broken')
                  : s.verdict;
                return (
                  <div key={s._id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/3 transition-colors">
                    <span className={`text-sm font-semibold flex-shrink-0 w-36 truncate ${verdictColor(s.verdict)}`}>
                      {verdictLabel}
                    </span>
                    <Link
                      to={problemHref}
                      className="flex-1 text-sm text-slate-300 hover:text-white truncate min-w-0"
                    >
                      {s.problem?.title || 'Unknown Problem'}
                    </Link>
                    <span className={`text-xs px-2 py-0.5 rounded border flex-shrink-0 ${diffColor(s.problem?.difficulty)}`}>
                      {s.problem?.difficulty}
                    </span>
                    <span className="text-xs text-slate-500 flex-shrink-0 font-mono uppercase">
                      {isBreak ? '💥 break' : s.language}
                    </span>
                    <span className="text-xs text-slate-600 flex-shrink-0">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
