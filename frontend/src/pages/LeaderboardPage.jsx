import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

/* ── Rank medal ───────────────────────────────────────────────────────────── */
function Medal({ rank }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return <span className="text-sm text-slate-500 font-mono w-6 text-center">{rank}</span>;
}

/* ── User row ─────────────────────────────────────────────────────────────── */
function UserRow({ rank, user, ratingKey, currentUserId }) {
  const isMe = user._id === currentUserId;
  return (
    <div className={`flex items-center gap-4 px-4 py-3.5 border-b border-white/5 last:border-0 transition-colors rounded-lg mx-1 ${isMe ? 'bg-violet-950/30 border-l-2 border-l-violet-500' : 'hover:bg-white/3'}`}>
      <div className="w-8 flex items-center justify-center flex-shrink-0">
        <Medal rank={rank} />
      </div>
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0">
        {user.avatar
          ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
          : (user.username?.[0] || '?').toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm truncate ${isMe ? 'text-violet-300' : 'text-white'}`}>
          {user.username} {isMe && <span className="text-xs text-violet-400">(you)</span>}
        </p>
        <p className="text-xs text-slate-500">{user.solvedCount ?? 0} solved · {user.breakCount ?? 0} breaks</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-base font-black text-violet-300">{user[ratingKey] ?? 1200}</p>
        <p className="text-xs text-slate-500">rating</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Leaderboard Page
══════════════════════════════════════════════════════════════════════════════ */
export default function LeaderboardPage({ user: currentUser }) {
  const [tab, setTab]           = useState('solvers');
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    const endpoint = tab === 'solvers' ? '/api/leaderboard/solvers' : '/api/leaderboard/breakers';
    axios.get(endpoint)
      .then(({ data }) => setUsers(data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [tab]);

  const ratingKey = tab === 'solvers' ? 'solverRating' : 'breakerRating';

  return (
    <div className="min-h-screen bg-dark-900 bg-grid pt-20">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-96 h-96 bg-amber-600" style={{ top: '-5%', left: '-5%', opacity: 0.1 }} />
        <div className="orb w-64 h-64 bg-violet-700" style={{ bottom: '10%', right: '-5%', opacity: 0.15 }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-4xl mb-2">👑</p>
          <h1 className="text-3xl font-black text-white mb-2">Leaderboard</h1>
          <p className="text-slate-400 text-sm">Top competitive programmers on CodeBreak</p>
        </div>

        {/* Top 3 podium */}
        {!loading && users.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-10">
            {/* 2nd */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-xl font-black text-white border-2 border-slate-400 overflow-hidden">
                {users[1].avatar ? <img src={users[1].avatar} alt="" className="w-full h-full object-cover" /> : users[1].username?.[0]?.toUpperCase()}
              </div>
              <p className="text-xs text-slate-300 font-semibold truncate max-w-16 text-center">{users[1].username}</p>
              <div className="w-16 h-16 bg-gradient-to-t from-slate-700 to-slate-600 rounded-t-xl flex items-end justify-center pb-2">
                <span className="text-slate-300 font-black text-xl">2</span>
              </div>
            </div>
            {/* 1st */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-2xl mb-1">👑</div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-2xl font-black text-white border-2 border-yellow-400 overflow-hidden">
                {users[0].avatar ? <img src={users[0].avatar} alt="" className="w-full h-full object-cover" /> : users[0].username?.[0]?.toUpperCase()}
              </div>
              <p className="text-xs text-yellow-300 font-bold truncate max-w-20 text-center">{users[0].username}</p>
              <div className="w-16 h-24 bg-gradient-to-t from-yellow-700 to-yellow-600 rounded-t-xl flex items-end justify-center pb-2">
                <span className="text-yellow-200 font-black text-2xl">1</span>
              </div>
            </div>
            {/* 3rd */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-xl font-black text-white border-2 border-amber-600 overflow-hidden">
                {users[2].avatar ? <img src={users[2].avatar} alt="" className="w-full h-full object-cover" /> : users[2].username?.[0]?.toUpperCase()}
              </div>
              <p className="text-xs text-slate-300 font-semibold truncate max-w-16 text-center">{users[2].username}</p>
              <div className="w-16 h-10 bg-gradient-to-t from-amber-800 to-amber-700 rounded-t-xl flex items-end justify-center pb-2">
                <span className="text-amber-300 font-black text-lg">3</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex glass rounded-xl p-1 border border-violet-900/20 mb-6 w-fit mx-auto">
          {[['solvers', '⚔ Solver Ranking'], ['breakers', '💥 Breaker Ranking']].map(([key, label]) => (
            <button
              key={key}
              id={`lb-tab-${key}`}
              onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === key
                  ? 'bg-violet-600/30 text-violet-300 border border-violet-600/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="glass rounded-2xl border border-violet-900/20 overflow-hidden">
          {loading ? (
            <div className="space-y-px p-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <p className="text-2xl mb-2">🏜</p>
              <p>No users on the leaderboard yet</p>
            </div>
          ) : (
            <div className="py-2">
              {users.map((u, i) => (
                <UserRow
                  key={u._id}
                  rank={i + 1}
                  user={u}
                  ratingKey={ratingKey}
                  currentUserId={currentUser?._id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
