import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import Navbar           from './components/Navbar.jsx';
import AuthPage         from './pages/AuthPage.jsx';
import LandingPage      from './pages/LandingPage.jsx';
import ProblemsPage     from './pages/ProblemsPage.jsx';
import CodingProblemPage from './pages/CodingProblemPage.jsx';
import ContestsPage     from './pages/ContestsPage.jsx';
import ContestDetailPage from './pages/ContestDetailPage.jsx';
import LeaderboardPage  from './pages/LeaderboardPage.jsx';
import ProfilePage      from './pages/ProfilePage.jsx';
import HostContestPage  from './pages/HostContestPage.jsx';
import BreakTheCodePage from './pages/BreakTheCodePage.jsx';
import AdminPage        from './pages/AdminPage.jsx';
import AddProblemPage   from './pages/AddProblemPage.jsx';

/* ── Auth helpers ─────────────────────────────────────────────────────────── */
function getStoredToken() { return localStorage.getItem('cb_token'); }
function setStoredToken(token) {
  if (token) localStorage.setItem('cb_token', token);
  else localStorage.removeItem('cb_token');
}

/* ── Protected route ──────────────────────────────────────────────────────── */
function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

/* ── Layout ───────────────────────────────────────────────────────────────── */
function Layout({ user, onLogout, children }) {
  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      {children}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   App
══════════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [user, setUser]           = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = getStoredToken();
    if (!token) { setAuthLoading(false); return; }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axios.get('/api/auth/me')
      .then(({ data }) => { if (data.success) setUser(data.user); })
      .catch(() => { setStoredToken(null); delete axios.defaults.headers.common['Authorization']; })
      .finally(() => setAuthLoading(false));
  }, []);

  const handleAuth = (userData, token) => {
    setUser(userData);
    if (token) {
      setStoredToken(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  };

  const handleLogout = () => {
    setUser(null);
    setStoredToken(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth — no navbar */}
        <Route
          path="/auth"
          element={user ? <Navigate to="/" replace /> : <AuthPage onAuth={handleAuth} />}
        />

        {/* Landing */}
        <Route path="/" element={
          <Layout user={user} onLogout={handleLogout}>
            <LandingPage user={user} />
          </Layout>
        } />

        {/* Problems list */}
        <Route path="/problems" element={
          <Layout user={user} onLogout={handleLogout}>
            <ProblemsPage user={user} />
          </Layout>
        } />

        {/* Coding problem */}
        <Route path="/problems/:slug" element={
          <Layout user={user} onLogout={handleLogout}>
            <CodingProblemPage user={user} />
          </Layout>
        } />

        {/* Break the Code problem */}
        <Route path="/break/:slug" element={
          <Layout user={user} onLogout={handleLogout}>
            <BreakTheCodePage user={user} />
          </Layout>
        } />

        {/* Contests list */}
        <Route path="/contests" element={
          <Layout user={user} onLogout={handleLogout}>
            <ContestsPage user={user} />
          </Layout>
        } />

        {/* Contest detail */}
        <Route path="/contests/:id" element={
          <Layout user={user} onLogout={handleLogout}>
            <ContestDetailPage user={user} />
          </Layout>
        } />

        {/* Leaderboard */}
        <Route path="/leaderboard" element={
          <Layout user={user} onLogout={handleLogout}>
            <LeaderboardPage user={user} />
          </Layout>
        } />

        {/* Profile — own */}
        <Route path="/profile" element={
          <Layout user={user} onLogout={handleLogout}>
            <ProfilePage user={user} />
          </Layout>
        } />

        {/* Profile — by username */}
        <Route path="/users/:username" element={
          <Layout user={user} onLogout={handleLogout}>
            <ProfilePage user={user} />
          </Layout>
        } />

        {/* Host a contest */}
        <Route path="/host-contest" element={
          <Layout user={user} onLogout={handleLogout}>
            <HostContestPage user={user} />
          </Layout>
        } />

        {/* Admin panel */}
        <Route path="/admin" element={
          <Layout user={user} onLogout={handleLogout}>
            <AdminPage user={user} />
          </Layout>
        } />

        {/* Admin — Add Problem */}
        <Route path="/admin/add-problem" element={
          <Layout user={user} onLogout={handleLogout}>
            <AddProblemPage user={user} />
          </Layout>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/* ── Coming Soon placeholder ──────────────────────────────────────────────── */
function ComingSoon({ title, icon }) {
  return (
    <div className="min-h-screen bg-dark-900 bg-grid flex items-center justify-center pt-16">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-96 h-96 bg-violet-700" style={{ top: '-5%', left: '-5%', opacity: 0.2 }} />
      </div>
      <div className="glass rounded-3xl p-14 text-center border border-violet-900/20 max-w-sm relative z-10">
        <p className="text-5xl mb-4">{icon}</p>
        <h1 className="text-2xl font-black text-white mb-2">{title}</h1>
        <p className="text-slate-400 text-sm">Coming soon — this page is under construction.</p>
      </div>
    </div>
  );
}
