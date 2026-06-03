import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

/* ── Helpers ──────────────────────────────────────────────────────────────────── */
function difficultyColor(d) {
  if (d === 'Easy') return 'text-emerald-400 bg-emerald-950/50 border-emerald-800/40';
  if (d === 'Medium') return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
  return 'text-red-400 bg-red-950/50 border-red-800/40';
}

function typeStyle(t) {
  if (t === 'coding') return 'text-violet-300 bg-violet-950/60 border-violet-700/40';
  return 'text-red-300 bg-red-950/40 border-red-700/40';
}

function typeLabel(t) {
  return t === 'coding' ? '⚔ Coding' : '💥 Break the Code';
}

function AcceptanceBar({ rate }) {
  const color = rate >= 60 ? '#22C55E' : rate >= 35 ? '#EAB308' : '#EF4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${rate}%`, background: color }}
        />
      </div>
      <span className="text-xs font-mono" style={{ color }}>{rate}%</span>
    </div>
  );
}

/* ── Skeleton row ─────────────────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-3 bg-white/5 rounded animate-pulse" style={{ width: `${40 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Problems Page
══════════════════════════════════════════════════════════════════════════════ */
export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [diffFilter, setDiffFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('');
  const [sortBy, setSortBy] = useState('default'); // default | acceptance-asc | acceptance-desc | difficulty

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      try {
        const params = { limit: 100 };
        if (typeFilter !== 'all') params.type = typeFilter;
        if (diffFilter !== 'all') params.difficulty = diffFilter;
        const { data } = await axios.get('/api/problems', { params });
        setProblems(data.problems || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [typeFilter, diffFilter]);

  // Client-side search + tag filter + sort
  const filtered = useMemo(() => {
    let list = [...problems];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }

    if (tagFilter) {
      list = list.filter((p) => p.tags?.some((t) => t.toLowerCase().includes(tagFilter.toLowerCase())));
    }

    if (sortBy === 'acceptance-asc') list.sort((a, b) => (a.acceptanceRate ?? 0) - (b.acceptanceRate ?? 0));
    else if (sortBy === 'acceptance-desc') list.sort((a, b) => (b.acceptanceRate ?? 0) - (a.acceptanceRate ?? 0));
    else if (sortBy === 'difficulty') {
      const order = { Easy: 0, Medium: 1, Hard: 2 };
      list.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
    }

    return list;
  }, [problems, search, tagFilter, sortBy]);

  // All unique tags
  const allTags = useMemo(() => {
    const s = new Set();
    problems.forEach((p) => p.tags?.forEach((t) => s.add(t)));
    return [...s].sort();
  }, [problems]);

  const counts = useMemo(() => ({
    easy: problems.filter((p) => p.difficulty === 'Easy').length,
    medium: problems.filter((p) => p.difficulty === 'Medium').length,
    hard: problems.filter((p) => p.difficulty === 'Hard').length,
  }), [problems]);

  return (
    <div className="min-h-screen bg-dark-900 bg-grid pt-20">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-96 h-96 bg-violet-700" style={{ top: '-5%', right: '-5%', opacity: 0.2 }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Problem Set</h1>
          <p className="text-slate-400">
            {loading ? '…' : `${filtered.length} problems`}
            {!loading && (
              <span className="ml-3 text-sm">
                <span className="text-emerald-400">{counts.easy} Easy</span>
                {' · '}
                <span className="text-amber-400">{counts.medium} Medium</span>
                {' · '}
                <span className="text-red-400">{counts.hard} Hard</span>
              </span>
            )}
          </p>
        </div>

        {/* ── Filter bar ────────────────────────────────────────────────── */}
        <div className="glass rounded-2xl p-4 border border-violet-900/20 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                id="problems-search"
                type="text"
                placeholder="Search problems…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-dark-700/60 border border-white/10 hover:border-violet-700/40 focus:border-violet-600/60 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 transition-all outline-none"
              />
            </div>

            {/* Type filter */}
            <select
              id="filter-type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-dark-700/60 border border-white/10 hover:border-violet-700/40 rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none transition-all cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="coding">⚔ Coding</option>
              <option value="break-the-code">💥 Break the Code</option>
            </select>

            {/* Difficulty filter */}
            <select
              id="filter-difficulty"
              value={diffFilter}
              onChange={(e) => setDiffFilter(e.target.value)}
              className="bg-dark-700/60 border border-white/10 hover:border-violet-700/40 rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none transition-all cursor-pointer"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">🟢 Easy</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Hard">🔴 Hard</option>
            </select>

            {/* Tag filter */}
            <select
              id="filter-tag"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="bg-dark-700/60 border border-white/10 hover:border-violet-700/40 rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none transition-all cursor-pointer"
            >
              <option value="">All Tags</option>
              {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            {/* Sort */}
            <select
              id="sort-problems"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-dark-700/60 border border-white/10 hover:border-violet-700/40 rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none transition-all cursor-pointer"
            >
              <option value="default">Sort: Default</option>
              <option value="difficulty">Sort: Difficulty</option>
              <option value="acceptance-desc">Sort: Easiest First</option>
              <option value="acceptance-asc">Sort: Hardest First</option>
            </select>

            {/* Reset */}
            {(search || typeFilter !== 'all' || diffFilter !== 'all' || tagFilter) && (
              <button
                onClick={() => { setSearch(''); setTypeFilter('all'); setDiffFilter('all'); setTagFilter(''); setSortBy('default'); }}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors px-3 py-2.5 border border-violet-800/30 rounded-xl hover:bg-violet-950/30"
              >
                ✕ Reset
              </button>
            )}
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────────────────────── */}
        <div className="glass rounded-2xl border border-violet-900/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider w-12">#</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Problem</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Difficulty</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Tags</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider w-36">Acceptance</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 8 }, (_, i) => <SkeletonRow key={i} />)
                  : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-slate-500">
                        <p className="text-2xl mb-2">🔍</p>
                        <p>No problems match your filters</p>
                      </td>
                    </tr>
                  )
                  : filtered.map((p, idx) => {
                      const rate = p.acceptanceRate ?? Math.round(((p.acceptedSubmissions ?? 0) / Math.max(p.totalSubmissions ?? 1, 1)) * 100);
                      return (
                        <tr
                          key={p._id}
                          className="border-b border-white/5 hover:bg-violet-950/10 transition-colors group"
                        >
                          <td className="px-4 py-4 text-slate-500 text-sm font-mono">{idx + 1}</td>
                          <td className="px-4 py-4">
                            <Link
                              to={`/problems/${p.slug}`}
                              id={`problem-${p.slug}`}
                              className="font-semibold text-white group-hover:text-violet-300 transition-colors flex items-center gap-2"
                            >
                              {p.isProblemOfDay && (
                                <span title="Problem of the Day" className="text-amber-400 text-xs">🔥</span>
                              )}
                              {p.title}
                            </Link>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${typeStyle(p.type)}`}>
                              {typeLabel(p.type)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${difficultyColor(p.difficulty)}`}>
                              {p.difficulty}
                            </span>
                          </td>
                          <td className="px-4 py-4 hidden md:table-cell">
                            <div className="flex gap-1.5 flex-wrap">
                              {(p.tags || []).slice(0, 3).map((t) => (
                                <button
                                  key={t}
                                  onClick={() => setTagFilter(t)}
                                  className="text-xs px-2 py-0.5 rounded-md bg-dark-600/80 border border-white/10 text-slate-400 hover:text-violet-300 hover:border-violet-700/50 transition-colors"
                                >
                                  {t}
                                </button>
                              ))}
                              {(p.tags || []).length > 3 && (
                                <span className="text-xs text-slate-600">+{p.tags.length - 3}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 w-36">
                            <AcceptanceBar rate={rate} />
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
