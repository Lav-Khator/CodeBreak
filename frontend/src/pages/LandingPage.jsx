import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

/* ── Helpers ──────────────────────────────────────────────────────────────────── */
function timeUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  if (diff <= 0) return 'Started';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function difficultyColor(d) {
  if (d === 'Easy') return 'text-emerald-400 bg-emerald-950/50 border-emerald-800/40';
  if (d === 'Medium') return 'text-amber-400 bg-amber-950/50 border-amber-800/40';
  return 'text-red-400 bg-red-950/50 border-red-800/40';
}

/* ── Stat card ────────────────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, color }) {
  return (
    <div className={`glass rounded-2xl p-6 border ${color} flex flex-col items-center text-center hover:scale-105 transition-transform duration-200`}>
      <span className="text-3xl mb-2">{icon}</span>
      <p className="text-3xl font-black text-white mb-1">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

/* ── Contest card ─────────────────────────────────────────────────────────────── */
function ContestCard({ contest }) {
  const status = contest.status;
  const statusStyles = {
    upcoming: 'text-blue-400 bg-blue-950/40 border-blue-700/40',
    ongoing: 'text-emerald-400 bg-emerald-950/40 border-emerald-700/40',
    past: 'text-slate-400 bg-slate-800/40 border-slate-700/40',
  };

  return (
    <div className="glass rounded-2xl p-5 border border-violet-900/20 hover:border-violet-600/40 transition-all duration-300 group hover:-translate-y-1">
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${statusStyles[status]}`}>
          {status === 'ongoing' ? '🔴 LIVE' : status === 'upcoming' ? '🕐 Upcoming' : '✓ Ended'}
        </span>
        <span className="text-xs text-slate-500 font-mono">
          {status === 'upcoming' ? `Starts in ${timeUntil(contest.startTime)}` : ''}
          {status === 'ongoing' ? `Ends in ${timeUntil(contest.endTime)}` : ''}
          {status === 'past' ? new Date(contest.endTime).toLocaleDateString() : ''}
        </span>
      </div>
      <h3 className="font-bold text-white text-base mb-1 group-hover:text-violet-300 transition-colors">
        {contest.title}
      </h3>
      <p className="text-sm text-slate-400 mb-3 line-clamp-2">{contest.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {(contest.tags || []).slice(0, 2).map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-violet-950/50 border border-violet-800/30 text-violet-400">
              {t}
            </span>
          ))}
        </div>
        <span className="text-xs text-slate-500">
          {contest.participants?.length ?? 0} registered
        </span>
      </div>
    </div>
  );
}

/* ── User rank row ─────────────────────────────────────────────────────────────── */
function UserRow({ rank, user, ratingKey }) {
  const rankStyles = {
    1: 'text-yellow-400',
    2: 'text-slate-300',
    3: 'text-amber-600',
  };

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0 hover:bg-white/3 rounded-lg px-2 transition-colors">
      <span className={`w-6 text-center font-black text-sm ${rankStyles[rank] || 'text-slate-500'}`}>
        {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
      </span>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0">
        {user.avatar
          ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
          : (user.username?.[0] || '?').toUpperCase()}
      </div>
      <span className="flex-1 text-sm text-slate-200 font-medium">{user.username}</span>
      <span className="text-sm font-bold text-violet-300">{user[ratingKey]}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Landing Page
══════════════════════════════════════════════════════════════════════════════ */
export default function LandingPage({ user }) {
  const [contests, setContests] = useState([]);
  const [dailyProblem, setDailyProblem] = useState(null);
  const [topSolvers, setTopSolvers] = useState([]);
  const [topBreakers, setTopBreakers] = useState([]);
  const [stats, setStats] = useState({ problems: 0, users: 0, contests: 0 });
  const [loading, setLoading] = useState(true);
  const [leaderTab, setLeaderTab] = useState('solvers');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [contestsRes, dailyRes, solversRes, breakersRes, problemsRes] = await Promise.allSettled([
          axios.get('/api/contests/upcoming'),
          axios.get('/api/problems/daily'),
          axios.get('/api/leaderboard/solvers'),
          axios.get('/api/leaderboard/breakers'),
          axios.get('/api/problems?limit=1'),
        ]);

        if (contestsRes.status === 'fulfilled') setContests(contestsRes.value.data.contests || []);
        if (dailyRes.status === 'fulfilled') setDailyProblem(dailyRes.value.data.problem);
        if (solversRes.status === 'fulfilled') setTopSolvers(solversRes.value.data.users?.slice(0, 5) || []);
        if (breakersRes.status === 'fulfilled') setTopBreakers(breakersRes.value.data.users?.slice(0, 5) || []);
        if (problemsRes.status === 'fulfilled')
          setStats(s => ({ ...s, problems: problemsRes.value.data.pagination?.total || 0 }));
      } catch (e) { /* silent */ }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const leaderUsers = leaderTab === 'solvers' ? topSolvers : topBreakers;
  const leaderRatingKey = leaderTab === 'solvers' ? 'solverRating' : 'breakerRating';

  return (
    <div className="min-h-screen bg-dark-900 bg-grid">
      {/* ── Ambient orbs ─────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-[600px] h-[600px] bg-violet-700" style={{ top: '-15%', left: '-10%' }} />
        <div className="orb w-[400px] h-[400px] bg-red-700" style={{ bottom: '10%', right: '-5%' }} />
        <div className="orb w-[300px] h-[300px] bg-cyan-700" style={{ top: '40%', left: '60%' }} />
      </div>

      <div className="relative z-10">
        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <section className="pt-32 pb-20 px-4 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-700/40 rounded-full px-4 py-2 text-xs text-violet-300 font-semibold mb-6 animate-pulse-slow">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
            Now live — Daily Challenges + Rated Contests
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-none mb-6 animate-slide-up">
            Code it.{' '}
            <span className="gradient-text-brand">Break it.</span>
            <br />Dominate.
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The only competitive programming platform with two disciplines — solve hard problems{' '}
            <span className="text-violet-400 font-medium">and</span> break buggy code. Earn two separate ratings, climb two leaderboards.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? '/problems' : '/auth'}
              id="hero-cta-primary"
              className="btn-primary px-8 py-3.5 rounded-2xl text-white font-bold text-base w-full sm:w-auto"
            >
              {user ? '→ Browse Problems' : '🚀 Start Competing Free'}
            </Link>
            <Link
              to="/contests"
              id="hero-cta-contests"
              className="px-8 py-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-600/50 hover:bg-violet-950/30 text-slate-300 hover:text-white font-semibold text-base transition-all duration-200 w-full sm:w-auto"
            >
              🏆 View Contests
            </Link>
          </div>
        </section>

        {/* ══ STATS ═════════════════════════════════════════════════════════ */}
        <section className="px-4 max-w-4xl mx-auto mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="📋" label="Problems" value={loading ? '…' : stats.problems || '8+'} color="border-violet-900/30" />
            <StatCard icon="👥" label="Coders" value={loading ? '…' : '1K+'} color="border-blue-900/30" />
            <StatCard icon="🏆" label="Contests" value={loading ? '…' : contests.length || '4'} color="border-amber-900/30" />
            <StatCard icon="💥" label="Breaks" value={loading ? '…' : '2K+'} color="border-red-900/30" />
          </div>
        </section>

        {/* ══ PROBLEM OF THE DAY + UPCOMING CONTESTS ══════════════════════ */}
        <section className="px-4 max-w-7xl mx-auto mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Problem of the Day */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🔥</span> Problem of the Day
              </h2>
              {loading ? (
                <div className="glass rounded-2xl p-6 border border-violet-900/20 animate-pulse">
                  <div className="h-4 bg-white/5 rounded mb-3 w-3/4" />
                  <div className="h-3 bg-white/5 rounded mb-2 w-1/2" />
                  <div className="h-20 bg-white/5 rounded mt-4" />
                </div>
              ) : dailyProblem ? (
                <Link
                  to={`/problems/${dailyProblem.slug}`}
                  id={`daily-problem-${dailyProblem.slug}`}
                  className="block glass rounded-2xl p-6 border border-violet-600/30 hover:border-violet-500/60 transition-all duration-300 group hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${difficultyColor(dailyProblem.difficulty)}`}>
                      {dailyProblem.difficulty}
                    </span>
                    <span className="text-xs text-violet-400 font-semibold">Daily Challenge</span>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors mb-2">
                    {dailyProblem.title}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                    {dailyProblem.description?.replace(/\*\*|`|##|#/g, '').slice(0, 150)}…
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(dailyProblem.tags || []).map((t) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-violet-950/60 border border-violet-800/30 text-violet-400">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {dailyProblem.acceptanceRate ?? Math.round((dailyProblem.acceptedSubmissions / Math.max(dailyProblem.totalSubmissions, 1)) * 100)}% acceptance
                    </span>
                    <span className="text-sm text-violet-400 font-semibold group-hover:gap-2 flex items-center gap-1 transition-all">
                      Solve now →
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="glass rounded-2xl p-6 border border-violet-900/20 text-center text-slate-500">
                  No daily problem set yet
                </div>
              )}

              {/* Two-discipline explainer */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="glass rounded-xl p-4 border border-violet-800/30">
                  <p className="text-violet-400 font-bold text-sm mb-1">⚔ Solver Mode</p>
                  <p className="text-xs text-slate-400">Write correct code to pass hidden test cases. Earn your solver rating.</p>
                </div>
                <div className="glass rounded-xl p-4 border border-red-800/30">
                  <p className="text-red-400 font-bold text-sm mb-1">💥 Breaker Mode</p>
                  <p className="text-xs text-slate-400">Find inputs that crash buggy programs. Earn your breaker rating.</p>
                </div>
              </div>
            </div>

            {/* Upcoming contests */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">🏆</span> Upcoming Contests
                </h2>
                <Link to="/contests" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                  View all →
                </Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="glass rounded-2xl p-5 border border-violet-900/20 animate-pulse h-28" />
                  ))}
                </div>
              ) : contests.length > 0 ? (
                <div className="space-y-3">
                  {contests.slice(0, 3).map((c) => <ContestCard key={c._id} contest={c} />)}
                </div>
              ) : (
                <div className="glass rounded-2xl p-8 border border-violet-900/20 text-center text-slate-500">
                  No upcoming contests — check back soon!
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ══ LEADERBOARD PREVIEW ═══════════════════════════════════════════ */}
        <section className="px-4 max-w-3xl mx-auto mb-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">👑</span> Top Users
            </h2>
            <Link to="/leaderboard" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
              Full leaderboard →
            </Link>
          </div>

          <div className="glass rounded-2xl border border-violet-900/20 overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-violet-900/30">
              {[['solvers', '⚔ Top Solvers'], ['breakers', '💥 Top Breakers']].map(([key, label]) => (
                <button
                  key={key}
                  id={`leaderboard-tab-${key}`}
                  onClick={() => setLeaderTab(key)}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-all duration-200 ${
                    leaderTab === key
                      ? 'text-violet-300 border-b-2 border-violet-500 bg-violet-950/30'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : leaderUsers.length > 0 ? (
                leaderUsers.map((u, i) => (
                  <UserRow key={u._id} rank={i + 1} user={u} ratingKey={leaderRatingKey} />
                ))
              ) : (
                <p className="text-center text-slate-500 py-6 text-sm">No users yet — be the first!</p>
              )}
            </div>
          </div>
        </section>

        {/* ══ CTA FOOTER BANNER ════════════════════════════════════════════ */}
        {!user && (
          <section className="px-4 max-w-4xl mx-auto mb-20">
            <div className="glass rounded-3xl p-10 border border-violet-700/30 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-900/20 via-transparent to-red-900/10" />
              <div className="relative z-10">
                <h2 className="text-3xl font-black text-white mb-3">Ready to compete?</h2>
                <p className="text-slate-400 mb-6">Join thousands of coders. Free forever.</p>
                <Link
                  to="/auth"
                  id="footer-cta"
                  className="btn-primary inline-block px-10 py-3.5 rounded-2xl text-white font-bold text-base"
                >
                  Create Free Account →
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
