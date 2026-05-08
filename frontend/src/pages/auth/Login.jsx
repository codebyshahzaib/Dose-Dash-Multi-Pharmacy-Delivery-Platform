import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_HOME, ROLE_META } from '../../utils/roleRoutes';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();
  const [searchParams]        = useSearchParams();

  const justRegistered = searchParams.get('registered') === 'true';

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      navigate(ROLE_HOME[user.role], { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">

      {/* ── Left branding panel ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-teal-600 via-cyan-600 to-sky-700 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-white text-lg shadow">Rx</div>
            <span className="text-white font-bold text-xl tracking-tight">Pharmacy Boy</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl font-extrabold text-white leading-tight">
            Healthcare<br />at your<br />fingertips.
          </h1>
          <p className="text-white/80 text-lg max-w-xs">
            Connect with certified pharmacists, manage prescriptions, and get medicines delivered — all in one place.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {Object.entries(ROLE_META).map(([, meta]) => (
              <div key={meta.label} className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-xl px-3 py-2">
                <span className="text-xl">{meta.icon}</span>
                <span className="text-white text-sm font-medium">{meta.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/50 text-sm">© 2026 Pharmacy Boy. All rights reserved.</p>
      </div>

      {/* ── Right form panel ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-950">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="h-9 w-9 rounded-xl bg-teal-500 flex items-center justify-center font-bold text-white shadow">Rx</div>
            <span className="text-white font-bold text-lg">Pharmacy Boy</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-1">Welcome back</h2>
          <p className="text-slate-400 mb-8">Sign in to your account to continue.</p>

          {/* Success toast after registration */}
          {justRegistered && (
            <div className="mb-6 flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <p className="text-emerald-400 text-sm">Account created successfully! Please sign in.</p>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
              <span className="text-red-400 mt-0.5">⚠</span>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Email address</label>
              <input
                id="login-email" name="email" type="email" autoComplete="email" required
                value={form.email} onChange={handleChange} placeholder="you@example.com"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Password</label>
              <input
                id="login-password" name="password" type="password" autoComplete="current-password" required
                value={form.password} onChange={handleChange} placeholder="••••••••"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>

            <button
              id="login-submit" type="submit" disabled={loading}
              className="w-full mt-2 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-400 font-semibold hover:text-teal-300 transition-colors">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}