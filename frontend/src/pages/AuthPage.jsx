import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

/* ── tiny helpers ─────────────────────────────────────────────────────────────── */
const API = '/api/auth';

/* ══════════════════════════════════════════════════════════════════════════════
   Particle background (decorative, canvas-free, purely CSS-driven)
══════════════════════════════════════════════════════════════════════════════ */
function Particles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 6}s`,
    duration: `${Math.random() * 4 + 4}s`,
    opacity: Math.random() * 0.4 + 0.1,
    color: i % 3 === 0 ? '#8B5CF6' : i % 3 === 1 ? '#EF4444' : '#06B6D4',
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            top: p.top,
            left: p.left,
            background: p.color,
            opacity: p.opacity,
            animation: `float ${p.duration} ${p.delay} ease-in-out infinite`,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Input field with floating icon
══════════════════════════════════════════════════════════════════════════════ */
function InputField({ icon, error, ...props }) {
  return (
    <div className="relative group">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400/60 group-focus-within:text-violet-400 transition-colors duration-200 pointer-events-none select-none text-base">
        {icon}
      </span>
      <input
        className={`input-field ${error ? 'error' : ''}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 animate-fade-in">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Password strength bar
══════════════════════════════════════════════════════════════════════════════ */
function PasswordStrength({ password }) {
  if (!password) return null;

  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#8B5CF6'];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-0.5 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= strength ? colors[strength] : 'rgba(255,255,255,0.1)' }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: colors[strength] }}>
        {labels[strength]}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Main Auth Page
══════════════════════════════════════════════════════════════════════════════ */
export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [globalSuccess, setGlobalSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* form state */
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirm: '',
  });

  const cardRef = useRef(null);

  /* clear messages on mode switch */
  useEffect(() => {
    setGlobalError('');
    setGlobalSuccess('');
    setFieldErrors({});
    setForm({ username: '', email: '', password: '', confirm: '' });
    setShowPassword(false);
    setShowConfirm(false);
  }, [mode]);

  /* tilt effect on card hover */
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const handleMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
      card.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg)`;
    };
    const handleLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    };
    card.addEventListener('mousemove', handleMove);
    card.addEventListener('mouseleave', handleLeave);
    return () => {
      card.removeEventListener('mousemove', handleMove);
      card.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setGlobalError('');
  };

  /* ── Client-side validation ─────────────────────────────────────────────── */
  const validate = () => {
    const errs = {};
    if (mode === 'register') {
      if (!form.username.trim()) errs.username = 'Username is required';
      else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username))
        errs.username = '3–20 chars, letters/numbers/underscores only';
    }
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'At least 6 characters';
    if (mode === 'register') {
      if (!form.confirm) errs.confirm = 'Please confirm your password';
      else if (form.confirm !== form.password) errs.confirm = 'Passwords do not match';
    }
    return errs;
  };

  /* ── Submit ──────────────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    setGlobalError('');
    setGlobalSuccess('');

    try {
      const endpoint = mode === 'login' ? `${API}/login` : `${API}/register`;
      const payload =
        mode === 'login'
          ? { email: form.email, password: form.password }
          : { username: form.username, email: form.email, password: form.password };

      const { data } = await axios.post(endpoint, payload);
      setGlobalSuccess(data.message);
      setTimeout(() => onAuth && onAuth(data.user, data.token), 800);
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Something went wrong. Please try again.';
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Google OAuth ─────────────────────────────────────────────────────────── */
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setGlobalError('');
    try {
      const { data } = await axios.post(`${API}/google`, {
        credential: credentialResponse.credential,
      });
      setGlobalSuccess(data.message);
      setTimeout(() => onAuth && onAuth(data.user, data.token), 800);
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGlobalError('Google sign-in was cancelled or failed.');
  };

  /* ══════════════════════════════════════════════════════════════════════════
     Render
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-dark-900 bg-grid flex items-center justify-center relative overflow-hidden p-4">
      {/* Ambient orbs */}
      <div
        className="orb w-96 h-96 bg-violet-600"
        style={{ top: '-10%', left: '-10%', animationDelay: '0s' }}
      />
      <div
        className="orb w-80 h-80 bg-red-600"
        style={{ bottom: '-10%', right: '-5%', animationDelay: '2s' }}
      />
      <div
        className="orb w-64 h-64 bg-cyan-600"
        style={{ top: '50%', left: '60%', animationDelay: '4s' }}
      />

      <Particles />

      {/* ── Main card ─────────────────────────────────────────────────────── */}
      <div
        ref={cardRef}
        className="glass rounded-3xl w-full max-w-md shadow-2xl animate-slide-up"
        style={{ transition: 'transform 0.15s ease-out', willChange: 'transform' }}
      >
        {/* Logo / brand */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="inline-flex items-center gap-2 mb-4 animate-float">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center shadow-lg glow-purple">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight gradient-text-brand">CodeBreak</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">
            {mode === 'login' ? 'Welcome back' : 'Join the arena'}
          </h1>
          <p className="text-slate-400 text-sm">
            {mode === 'login'
              ? 'Sign in to continue your coding journey'
              : 'Create your account and start competing'}
          </p>
        </div>

        {/* ── Mode tabs ────────────────────────────────────────────────────── */}
        <div className="px-8 mb-6">
          <div className="relative flex bg-dark-800 rounded-xl p-1 border border-violet-900/30">
            {/* Sliding pill */}
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-2px)] rounded-lg bg-gradient-to-r from-violet-700 to-violet-600 transition-all duration-300 ease-in-out"
              style={{ left: mode === 'login' ? '4px' : 'calc(50% + 2px)' }}
            />
            {['login', 'register'].map((m) => (
              <button
                key={m}
                id={`tab-${m}`}
                onClick={() => setMode(m)}
                className={`relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 z-10 ${
                  mode === m ? 'text-white' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {m === 'login' ? '🔐 Sign In' : '🚀 Register'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Form ─────────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="px-8 space-y-4" noValidate>
          {/* Global feedback */}
          {globalError && (
            <div className="flex items-center gap-2.5 bg-red-950/60 border border-red-500/40 rounded-xl px-4 py-3 text-red-300 text-sm animate-fade-in">
              <span className="text-lg">✕</span>
              <span>{globalError}</span>
            </div>
          )}
          {globalSuccess && (
            <div className="flex items-center gap-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl px-4 py-3 text-emerald-300 text-sm animate-fade-in">
              <span className="text-lg">✓</span>
              <span>{globalSuccess}</span>
            </div>
          )}

          {/* Username (register only) */}
          {mode === 'register' && (
            <div className="animate-fade-in">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                Username
              </label>
              <InputField
                icon="@"
                type="text"
                name="username"
                id="username"
                placeholder="your_handle"
                value={form.username}
                onChange={handleChange}
                error={fieldErrors.username}
                autoComplete="username"
                autoFocus
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
              Email
            </label>
            <InputField
              icon="✉"
              type="email"
              name="email"
              id="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={fieldErrors.email}
              autoComplete="email"
              autoFocus={mode === 'login'}
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Password
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  onClick={() => alert('Forgot password flow — coming soon!')}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400/60 group-focus-within:text-violet-400 transition-colors pointer-events-none select-none">
                🔑
              </span>
              <input
                className={`input-field pr-12 ${fieldErrors.password ? 'error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-400 transition-colors text-sm"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <span>⚠</span> {fieldErrors.password}
              </p>
            )}
            {mode === 'register' && <PasswordStrength password={form.password} />}
          </div>

          {/* Confirm password (register only) */}
          {mode === 'register' && (
            <div className="animate-fade-in">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                Confirm Password
              </label>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400/60 group-focus-within:text-violet-400 transition-colors pointer-events-none select-none">
                  🔒
                </span>
                <input
                  className={`input-field pr-12 ${fieldErrors.confirm ? 'error' : ''}`}
                  type={showConfirm ? 'text' : 'password'}
                  name="confirm"
                  id="confirm"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-400 transition-colors text-sm"
                >
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {fieldErrors.confirm && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <span>⚠</span> {fieldErrors.confirm}
                </p>
              )}
            </div>
          )}

          {/* Submit button */}
          <button
            id="submit-auth"
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {mode === 'login' ? 'Signing in…' : 'Creating account…'}
              </>
            ) : (
              <>{mode === 'login' ? '🔐 Sign In' : '🚀 Create Account'}</>
            )}
          </button>
        </form>

        {/* ── Divider ────────────────────────────────────────────────────────── */}
        <div className="px-8 my-5 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-violet-800/40 to-transparent" />
          <span className="text-xs text-slate-500 font-medium tracking-wider">OR CONTINUE WITH</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-violet-800/40 to-transparent" />
        </div>

        {/* ── Google OAuth ──────────────────────────────────────────────────── */}
        <div className="px-8 pb-8">
          <div
            id="google-signin-btn"
            className="w-full flex justify-center rounded-xl overflow-hidden border border-violet-900/30 hover:border-violet-600/50 transition-all duration-200 hover:shadow-lg hover:shadow-violet-900/20"
          >
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              theme="filled_black"
              shape="rectangular"
              size="large"
              text={mode === 'login' ? 'signin_with' : 'signup_with'}
              width="356"
            />
          </div>

          {/* Terms / switch mode */}
          <div className="mt-5 text-center space-y-2">
            {mode === 'register' && (
              <p className="text-xs text-slate-500">
                By registering you agree to our{' '}
                <button className="text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-2">
                  Terms
                </button>{' '}
                &{' '}
                <button className="text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-2">
                  Privacy Policy
                </button>
              </p>
            )}
            <p className="text-sm text-slate-400">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                id={`switch-to-${mode === 'login' ? 'register' : 'login'}`}
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
              >
                {mode === 'login' ? 'Register here' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* ── Dual-rating badge ─────────────────────────────────────────────── */}
        <div className="mx-8 mb-8 mt-2 flex items-center justify-center gap-3">
          <div className="flex-1 rounded-xl bg-violet-950/40 border border-violet-800/30 px-3 py-2 text-center">
            <p className="text-[10px] text-violet-400 font-semibold uppercase tracking-wider mb-0.5">Solver</p>
            <p className="text-xs text-slate-300">Conquer algorithms</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-dark-600 border border-slate-700 flex items-center justify-center text-slate-500 text-xs font-bold">
            ⚔
          </div>
          <div className="flex-1 rounded-xl bg-red-950/30 border border-red-800/30 px-3 py-2 text-center">
            <p className="text-[10px] text-red-400 font-semibold uppercase tracking-wider mb-0.5">Breaker</p>
            <p className="text-xs text-slate-300">Break buggy code</p>
          </div>
        </div>
      </div>
    </div>
  );
}
