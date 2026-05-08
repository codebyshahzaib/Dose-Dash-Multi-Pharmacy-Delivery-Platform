import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_HOME } from '../utils/roleRoutes';

export default function DashboardShell({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const home = ROLE_HOME[user?.role] || '/login';

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 to-teal-50">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-400/10 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-400/10 blur-3xl" />

      <div className="relative z-10 w-full px-4 sm:px-8 xl:px-12 py-4 sm:py-8">
        {/* Navigation */}
        <nav className="mb-8 glass-panel rounded-3xl p-4 px-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-teal-600 text-white font-bold text-lg shadow-lg shadow-teal-500/30">
                Rx
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Welcome back,</p>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 capitalize">{user?.name}</h2>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate(home)}
                className="rounded-xl border border-slate-200 bg-white/60 hover:bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all"
              >
                Home
              </button>
              <button
                onClick={handleLogout}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-2">
            {title}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            {subtitle}
          </p>
        </div>

        {/* Content */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {children}
        </div>
      </div>
    </div>
  );
}