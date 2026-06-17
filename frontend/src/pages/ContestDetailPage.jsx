import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function statusOf(c) {
  const now = Date.now();
  if (new Date(c.startTime) > now) return 'upcoming';
  if (new Date(c.endTime)   > now) return 'ongoing';
  return 'past';
}

function formatDate(d) {
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatMinutes(mins) {
  if (!mins) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/* ── Countdown timer ─────────────────────────────────────────────────────── */
function Countdown({ targetDate, label }) {
  const [remaining, setRemaining] = useState('');
  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate) - Date.now();
      if (diff <= 0) { setRemaining('00:00:00'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return (
    <div className="text-center">
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-black text-white font-mono tracking-widest">{remaining}</p>
    </div>
  );
}

/* ── Difficulty badge ─────────────────────────────────────────────────────── */
function DiffBadge({ d }) {
  const cls = d === 'Easy'   ? 'text-emerald-400 border-emerald-700/40 bg-emerald-950/30'
            : d === 'Medium' ? 'text-amber-400 border-amber-700/40 bg-amber-950/30'
            :                  'text-red-400 border-red-700/40 bg-red-950/30';
  return <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${cls}`}>{d}</span>;
}

/* ── Leaderboard ─────────────────────────────────────────────────────────── */
function Leaderboard({ contestId, problems }) {
  const [board, setBoard]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);

  useEffect(() => {
    axios.get(`/api/contests/${contestId}/leaderboard`)
      .then(({ data }) => { setBoard(data.leaderboard || []); setTotal(data.totalProblems || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [contestId]);

  if (loading) return (
    <div className="flex justify-center py-10">
      <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
    </div>
  );

  if (board.length === 0) return (
    <div className="text-center py-12 text-slate-500">
      <p className="text-3xl mb-2">📭</p>
      <p className="text-sm">No submissions yet.</p>
    </div>
  );

  // Build problem id → index map for column headers
  const probIds = problems.map((p) => p._id);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase w-12">#</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">User</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">Solved</th>
            {problems.map((p, i) => (
              <th key={p._id} className="px-3 py-3 text-center text-xs font-semibold text-slate-400 uppercase">
                {String.fromCharCode(65 + i)}
              </th>
            ))}
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">Penalty</th>
          </tr>
        </thead>
        <tbody>
          {board.map((row, idx) => {
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;
            return (
              <tr key={row.user._id} className="border-b border-white/5 hover:bg-violet-950/10 transition-colors">
                <td className="px-4 py-3.5 text-slate-400 font-mono text-sm">
                  {medal || idx + 1}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0">
                      {row.user.avatar
                        ? <img src={row.user.avatar} alt="" className="w-full h-full object-cover" />
                        : (row.user.username?.[0] || '?').toUpperCase()}
                    </div>
                    <span className="font-semibold text-white">{row.user.username}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className="text-emerald-400 font-black text-base">{row.solved}</span>
                  <span className="text-slate-600 text-xs">/{total}</span>
                </td>
                {problems.map((p) => {
                  const pen = row.solvedProblems?.[p._id];
                  return (
                    <td key={p._id} className="px-3 py-3.5 text-center">
                      {pen !== undefined
                        ? <span className="text-emerald-400 text-xs font-bold">✓ {formatMinutes(pen)}</span>
                        : <span className="text-slate-700 text-xs">—</span>}
                    </td>
                  );
                })}
                <td className="px-4 py-3.5 text-center text-slate-400 text-xs font-mono">
                  {formatMinutes(row.penalty)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Contest Detail Page
══════════════════════════════════════════════════════════════════════════════ */
export default function ContestDetailPage({ user }) {
  const { id } = useParams();
  const [contest, setContest]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [notFound, setNotFound]       = useState(false);
  const [registering, setRegistering] = useState(false);
  const [solvedIds, setSolvedIds]     = useState([]); // problem IDs solved by user
  const [tab, setTab]                 = useState('problems'); // problems | leaderboard

  useEffect(() => {
    axios.get(`/api/contests/${id}`)
      .then(({ data }) => setContest(data.contest))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch user's progress once contest is loaded
  useEffect(() => {
    if (!user || !contest) return;
    const s = statusOf(contest);
    if (s === 'upcoming') return; // no progress to fetch
    axios.get(`/api/contests/${id}/progress`)
      .then(({ data }) => setSolvedIds(data.solvedProblemIds || []))
      .catch(() => {});
  }, [user, contest, id]);

  const handleRegister = async () => {
    if (!user) return;
    setRegistering(true);
    try {
      await axios.post(`/api/contests/${id}/register`);
      setContest((c) => ({ ...c, participants: [...(c.participants || []), user._id] }));
    } catch {}
    finally { setRegistering(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center pt-16">
      <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
    </div>
  );

  if (notFound || !contest) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center pt-16">
      <div className="glass rounded-2xl p-10 text-center border border-violet-900/20 max-w-sm">
        <p className="text-4xl mb-4">🔍</p>
        <h2 className="text-xl font-bold text-white mb-4">Contest Not Found</h2>
        <Link to="/contests" className="btn-primary px-6 py-2.5 rounded-xl text-white text-sm font-semibold inline-block">
          ← Back to Contests
        </Link>
      </div>
    </div>
  );

  const status   = statusOf(contest);
  const isReg    = user && contest.participants?.some((p) => (typeof p === 'object' ? p._id : p) === user._id);
  const problems = contest.problems || [];

  const statusStyle = {
    upcoming: { badge: 'text-blue-300 bg-blue-950/50 border-blue-700/40',         label: '🕐 Upcoming' },
    ongoing:  { badge: 'text-emerald-300 bg-emerald-950/50 border-emerald-700/40', label: '🔴 Live Now' },
    past:     { badge: 'text-slate-400 bg-slate-800/40 border-slate-700/40',       label: '✓ Ended' },
  }[status];

  return (
    <div className="min-h-screen bg-dark-900 bg-grid pt-20">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-96 h-96 bg-violet-700" style={{ top: '-5%', right: '-5%', opacity: 0.2 }} />
        <div className="orb w-64 h-64 bg-blue-700"   style={{ bottom: '10%', left: '-5%', opacity: 0.1 }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        <Link to="/contests" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors w-fit">
          ← Back to Contests
        </Link>

        {/* Contest header card */}
        <div className="glass rounded-2xl border border-violet-900/20 p-6 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${statusStyle.badge}`}>
                  {statusStyle.label}
                </span>
              </div>
              <h1 className="text-2xl font-black text-white mb-2">{contest.title}</h1>
              {contest.description && <p className="text-slate-400 text-sm mb-4">{contest.description}</p>}
              <div className="flex items-center gap-5 text-sm text-slate-500 flex-wrap">
                <span>📋 {problems.length} problems</span>
                <span>👥 {contest.participants?.length ?? 0} registered</span>
                {contest.hostedBy && <span>by <span className="text-violet-400">@{contest.hostedBy.username}</span></span>}
              </div>
            </div>
            <div className="flex-shrink-0">
              {status === 'upcoming' && (
                <button onClick={handleRegister} disabled={isReg || registering || !user}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isReg      ? 'bg-emerald-950/40 border border-emerald-700/40 text-emerald-400 cursor-default'
                    : !user    ? 'bg-dark-700/40 border border-white/10 text-slate-500 cursor-not-allowed'
                    : 'btn-primary text-white'
                  }`}>
                  {registering ? '…' : isReg ? '✓ Registered' : !user ? 'Sign in to register' : 'Register'}
                </button>
              )}
            </div>
          </div>

          {/* Time + countdown */}
          <div className="mt-5 pt-5 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Start</p>
              <p className="text-sm text-white font-semibold">{formatDate(contest.startTime)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">End</p>
              <p className="text-sm text-white font-semibold">{formatDate(contest.endTime)}</p>
            </div>
            <div className="flex items-center justify-start sm:justify-end">
              {status === 'ongoing'  && <Countdown targetDate={contest.endTime}   label="Time Remaining" />}
              {status === 'upcoming' && <Countdown targetDate={contest.startTime} label="Starts In" />}
              {status === 'past'     && <p className="text-slate-500 text-sm font-semibold">Contest ended</p>}
            </div>
          </div>
        </div>

        {/* Tab bar — only show for ongoing/past */}
        {status !== 'upcoming' && (
          <div className="flex glass rounded-xl p-1 border border-violet-900/20 mb-4 w-fit">
            <button onClick={() => setTab('problems')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'problems' ? 'bg-violet-600/30 text-violet-300 border border-violet-600/40' : 'text-slate-400 hover:text-white'}`}>
              📋 Problems
            </button>
            {(status === 'ongoing' || status === 'past') && (
              <button onClick={() => setTab('leaderboard')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'leaderboard' ? 'bg-violet-600/30 text-violet-300 border border-violet-600/40' : 'text-slate-400 hover:text-white'}`}>
                🏆 Leaderboard
              </button>
            )}
          </div>
        )}

        {/* Upcoming — just show a waiting message */}
        {status === 'upcoming' && (
          <div className="glass rounded-2xl border border-violet-900/20 p-10 text-center">
            <p className="text-4xl mb-4">🔒</p>
            <h3 className="text-lg font-bold text-white mb-2">Problems will be revealed when the contest starts</h3>
            <p className="text-sm text-slate-500">Register now and come back when the countdown hits zero.</p>
          </div>
        )}

        {/* Problems tab — only for ongoing/past */}
        {tab === 'problems' && status !== 'upcoming' && (
          <div className="glass rounded-2xl border border-violet-900/20 overflow-hidden">
            {problems.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p className="text-2xl mb-2">📭</p>
                <p className="text-sm">No problems added to this contest yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {problems.map((p, idx) => {
                  const letter  = String.fromCharCode(65 + idx);
                  const href    = `${p.type === 'break-the-code' ? `/break/${p.slug}` : `/problems/${p.slug}`}?contest=${id}`;
                  const locked  = status === 'upcoming';
                  const isSolved = solvedIds.includes(p._id?.toString() || p._id);

                  return (
                    <div key={p._id}
                      className={`flex items-center gap-4 px-5 py-4 ${!locked ? 'hover:bg-violet-950/10' : ''} transition-colors group`}>
                      {/* Letter label */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0 ${
                        isSolved
                          ? 'bg-emerald-950/60 border border-emerald-700/40 text-emerald-400'
                          : 'bg-violet-950/60 border border-violet-700/30 text-violet-300'
                      }`}>
                        {isSolved ? '✓' : letter}
                      </div>

                      <div className="flex-1 min-w-0">
                        {locked ? (
                          <p className="font-semibold text-slate-400 truncate">{p.title}</p>
                        ) : (
                          <Link to={href} className="font-semibold text-white group-hover:text-violet-300 transition-colors truncate block">
                            {p.title}
                          </Link>
                        )}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <DiffBadge d={p.difficulty} />
                          <span className={`text-xs px-1.5 py-0.5 rounded border ${p.type === 'coding' ? 'text-violet-400 border-violet-700/30' : 'text-rose-400 border-rose-700/30'}`}>
                            {p.type === 'coding' ? '⚔ Coding' : '💥 Break'}
                          </span>
                          {isSolved && <span className="text-xs text-emerald-500 font-semibold">Solved</span>}
                        </div>
                      </div>

                      {locked ? (
                        <span className="text-slate-600 text-xs flex-shrink-0">🔒 Locked</span>
                      ) : (
                        <Link to={href}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition flex-shrink-0 ${
                            isSolved
                              ? 'border-emerald-700/30 text-emerald-400 hover:bg-emerald-950/20'
                              : 'border-violet-700/30 text-violet-400 hover:bg-violet-950/30'
                          }`}>
                          {isSolved ? '↩ Revisit' : 'Solve →'}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Leaderboard tab */}
        {tab === 'leaderboard' && (
          <div className="glass rounded-2xl border border-violet-900/20 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h2 className="text-base font-bold text-white">Contest Standings</h2>
              <p className="text-xs text-slate-500 mt-0.5">Ranked by problems solved, then by penalty time</p>
            </div>
            <Leaderboard contestId={id} problems={problems} />
          </div>
        )}
      </div>
    </div>
  );
}
