import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PUBLIC_ROLES, ROLE_META } from '../../utils/roleRoutes';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const selectRole = (role) =>
    setForm((p) => ({ ...p, role }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role) { setError('Please select your role to continue.'); return; }
    setError('');
    setLoading(true);
    try {
      await register(form);
      // Redirect to login with a success flag so Login can show a toast
      navigate('/login?registered=true', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedMeta = form.role ? ROLE_META[form.role] : null;

  return (
    <div className="min-h-screen flex bg-slate-950">

      {/* ── Left branding panel ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 bg-gradient-to-br from-violet-700 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-white shadow">Rx</div>
          <span className="text-white font-bold text-xl tracking-tight">Pharmacy Boy</span>
        </div>

        <div className="relative z-10 space-y-5">
          <h1 className="text-4xl font-extrabold text-white leading-snug">
            Join the platform trusted by patients & professionals.
          </h1>
          <p className="text-white/75">One account. Four roles. Zero friction.</p>

          <div className="space-y-3 pt-2">
            {PUBLIC_ROLES.map((r) => {
              const m = ROLE_META[r];
              return (
                <div key={r} className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-3">
                  <span className="text-2xl">{m.icon}</span>
                  <div>
                    <p className="text-white font-semibold text-sm">{m.label}</p>
                    <p className="text-white/60 text-xs">{m.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="relative z-10 text-white/40 text-sm">© 2026 Pharmacy Boy.</p>
      </div>

      {/* ── Right form panel ─────────────────────────────────── */}
      <div className="flex-1 flex items-start justify-center p-6 pt-10 overflow-y-auto bg-slate-950">
        <div className="w-full max-w-lg">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-9 w-9 rounded-xl bg-violet-500 flex items-center justify-center font-bold text-white">Rx</div>
            <span className="text-white font-bold text-lg">Pharmacy Boy</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-1">Create your account</h2>
          <p className="text-slate-400 mb-8">Start by choosing your role below.</p>

          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
              <span className="text-red-400 mt-0.5">⚠</span>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Role cards */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">I am a…</label>
              <div className="grid grid-cols-2 gap-3">
                {PUBLIC_ROLES.map((r) => {
                  const m = ROLE_META[r];
                  const active = form.role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      id={`role-${r.toLowerCase().replace('_','-')}`}
                      onClick={() => selectRole(r)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all
                        ${active
                          ? `bg-gradient-to-br ${m.color} border-transparent text-white shadow-lg`
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'}`}
                    >
                      <span className="text-2xl">{m.icon}</span>
                      <div>
                        <p className="font-bold text-sm">{m.label}</p>
                        <p className={`text-xs leading-tight ${active ? 'text-white/70' : 'text-slate-500'}`}>
                          {m.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Full name</label>
              <input
                id="register-name" name="name" type="text" required autoComplete="name"
                value={form.name} onChange={handleChange}
                placeholder={selectedMeta ? `Your name as a ${selectedMeta.label}` : 'Your full name'}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Phone Number</label>
                <input
                  id="register-phone" name="phone" type="tel" required autoComplete="tel"
                  value={form.phone || ''} onChange={handleChange}
                  placeholder="0300-1234567"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">City</label>
                <input
                  id="register-city" name="city" type="text" required autoComplete="address-level2"
                  value={form.city || ''} onChange={handleChange}
                  placeholder="e.g. Lahore"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Email address</label>
              <input
                id="register-email" name="email" type="email" required autoComplete="email"
                value={form.email} onChange={handleChange} placeholder="you@example.com"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Password</label>
              <input
                id="register-password" name="password" type="password" required minLength={8} autoComplete="new-password"
                value={form.password} onChange={handleChange} placeholder="At least 8 characters"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>

            <button
              id="register-submit" type="submit" disabled={loading || !form.role}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg
                ${form.role
                  ? `bg-gradient-to-r ${selectedMeta?.color ?? 'from-violet-500 to-indigo-500'} hover:opacity-90 shadow-violet-500/20`
                  : 'bg-slate-700 cursor-not-allowed opacity-60'}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : form.role ? `Register as ${ROLE_META[form.role]?.label}` : 'Select a role to continue'}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 text-sm pb-10">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}