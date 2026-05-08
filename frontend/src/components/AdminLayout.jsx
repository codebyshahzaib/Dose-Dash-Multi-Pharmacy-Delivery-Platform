import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  Activity, 
  LogOut, 
  Menu, 
  X,
  Lock,
  ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin', label: 'Command Center', icon: LayoutDashboard, end: true },
  { to: '/admin/pharmacists', label: 'Medical Authorities', icon: UserCheck },
  { to: '/admin/users', label: 'User Directory', icon: Users },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const activeLabel = NAV_ITEMS.find(item => 
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  )?.label || 'Administration';

  return (
    <div className="min-h-screen relative bg-slate-50 overflow-x-hidden font-sans selection:bg-indigo-100">
      <div className="relative z-10 flex min-h-screen">
        
        {/* SIDEBAR (Desktop) */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 z-30 h-screen fixed top-0 left-0">
          <div className="flex flex-col h-full">
            {/* Branding */}
            <div className="p-8 pb-10 flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/10">
                <Shield size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 font-outfit leading-none uppercase">Admin</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mt-1">Platform Root</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
              <div className="px-4 mb-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Management</p>
              </div>
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all group ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-600'} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight size={14} className="text-white/40" />}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Profile / Logout */}
            <div className="p-6 mt-auto border-t border-slate-100 bg-slate-50/50">
              <div className="px-2 pb-6 flex items-center gap-3">
                <div className="h-9 w-9 bg-white rounded-lg flex items-center justify-center text-indigo-600 border border-slate-200 shadow-sm">
                   <Lock size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate uppercase tracking-tight">{user?.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Root Session</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-200"
              >
                <LogOut size={14} />
                Terminate Session
              </button>
            </div>
          </div>
        </aside>

        {/* MOBILE HEADER */}
        <header className="lg:hidden fixed top-0 inset-x-0 h-16 bg-white z-40 border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-900 text-white">
              <Shield size={16} />
            </div>
            <span className="font-bold text-slate-900 text-xs font-outfit uppercase tracking-widest">{activeLabel}</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-200"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* MOBILE OVERLAY MENU */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-white p-8 pt-24 animate-fade-in">
             <nav className="space-y-3">
               {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-6 py-5 rounded-2xl text-base font-bold transition-all ${
                      isActive ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-500 bg-slate-50'
                    }`
                  }
                >
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-12 pt-12 border-t border-slate-100">
               <button onClick={handleLogout} className="w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-rose-600 bg-rose-50 border border-rose-100 flex items-center justify-center gap-3">
                 <LogOut size={20} />
                 Sign Out
                </button>
            </div>
          </div>
        )}

        {/* MAIN AREA */}
        <main className="flex-1 lg:ml-64 p-6 pt-24 lg:pt-12 lg:p-12 min-h-screen w-full relative">
           <div className="max-w-[1400px] mx-auto relative z-10">
              <Outlet />
           </div>
           <div className="h-28 lg:hidden" />
        </main>
      </div>
    </div>
  );
}
