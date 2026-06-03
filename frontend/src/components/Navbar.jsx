import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: '⚡' },
  { to: '/problems', label: 'Problems', icon: '📋' },
  { to: '/contests', label: 'Contests', icon: '🏆' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '👑' },
];

export default function Navbar({ user, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-dark-900/90 backdrop-blur-xl border-b border-violet-900/30 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ─────────────────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center shadow-md group-hover:shadow-violet-500/40 transition-shadow">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <span className="text-lg font-black tracking-tight gradient-text-brand">CodeBreak</span>
          </Link>

          {/* ── Desktop nav links ─────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <span className="text-xs">{icon}</span>
                {label}
              </NavLink>
            ))}
          </div>

          {/* ── Right section ─────────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Rating badges */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 bg-violet-950/60 border border-violet-700/40 rounded-lg px-2.5 py-1.5 text-violet-300">
                    <span>⚔</span> {user.solverRating ?? 1200}
                  </span>
                  <span className="flex items-center gap-1 bg-red-950/40 border border-red-700/40 rounded-lg px-2.5 py-1.5 text-red-300">
                    <span>💥</span> {user.breakerRating ?? 1200}
                  </span>
                </div>

                {/* Avatar + menu */}
                <div className="relative group">
                  <button
                    id="navbar-user-menu"
                    className="flex items-center gap-2 bg-dark-600/60 border border-slate-700/50 hover:border-violet-600/50 rounded-xl px-3 py-1.5 transition-all duration-200"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                      {user.avatar
                        ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                        : (user.username?.[0] || '?').toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-300 font-medium">{user.username}</span>
                    <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl border border-violet-900/30 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                    <div className="p-1">
                      <Link to="/profile" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                        <span>👤</span> Profile
                      </Link>
                      <Link to="/host-contest" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                        <span>🎯</span> Host Contest
                      </Link>
                      <div className="h-px bg-violet-900/30 my-1" />
                      <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
                      >
                        <span>🚪</span> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth"
                  className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile hamburger ─────────────────────────────────────────── */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* ── Mobile menu ───────────────────────────────────────────────── */}
        {menuOpen && (
          <div className="md:hidden glass border-t border-violet-900/20 rounded-b-2xl pb-4 animate-slide-up">
            {NAV_LINKS.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive ? 'text-violet-300' : 'text-slate-400'
                  }`
                }
              >
                <span>{icon}</span> {label}
              </NavLink>
            ))}
            {user ? (
              <button onClick={onLogout} className="w-full text-left px-4 py-3 text-sm text-red-400">
                🚪 Sign Out
              </button>
            ) : (
              <Link to="/auth" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm text-violet-400">
                🔐 Sign In / Register
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
