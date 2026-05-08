import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  Menu, 
  X,
  Bike,
  Activity,
  LayoutDashboard
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/rider', label: 'Deliveries', icon: LayoutDashboard, end: true },
];

export default function RiderLayout() {
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

  return (
    <div className="min-h-screen relative bg-slate-50 overflow-x-hidden font-sans">
      <div className="relative z-10 flex min-h-screen">
        
        {/* SIDEBAR (Desktop) */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 z-30 h-screen fixed top-0 left-0 overflow-y-auto">
          <div className="flex flex-col h-full">
            <div className="p-8 pb-10 flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
                <Bike size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 font-outfit leading-none">PharmaBoy</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mt-1">Rider Portal</p>
              </div>
            </div>

            <nav className="flex-1 px-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-900'} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="p-6 mt-auto border-t border-slate-100">
              <div className="px-2 pb-6 flex items-center gap-3">
                <div className="h-9 w-9 bg-teal-600 rounded-lg flex items-center justify-center text-white">
                    <Activity size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all group"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* MOBILE HEADER */}
        <header className="lg:hidden fixed top-0 inset-x-0 h-16 bg-white z-40 border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-teal-600 text-white">
              <Bike size={16} />
            </div>
            <span className="font-bold text-slate-900 text-sm font-outfit uppercase tracking-widest">Deliveries</span>
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
          <div className="lg:hidden fixed inset-0 z-50 bg-white p-8 pt-24 animate-fade-in shadow-2xl">
             <nav className="space-y-4">
               {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-6 py-5 rounded-3xl text-sm font-black uppercase tracking-widest transition-all ${
                      isActive ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-500 hover:bg-slate-50'
                    }`
                  }
                >
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-12 pt-12 border-t border-slate-100">
               <button onClick={handleLogout} className="w-full py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 bg-rose-50 flex items-center justify-center gap-3">
                 <LogOut size={20} />
                 End Session
                </button>
            </div>
          </div>
        )}

        {/* MAIN AREA */}
        <main className="flex-1 lg:ml-64 p-6 pt-24 lg:pt-12 lg:p-12 min-h-screen max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
