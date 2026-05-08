import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  UserCircle, 
  History, 
  LogOut, 
  Menu, 
  X,
  Stethoscope,
  Activity
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/pharmacist', label: 'Workbench', icon: LayoutDashboard, end: true },
  { to: '/pharmacist/quotes', label: 'Active Quotes', icon: Activity },
  { to: '/pharmacist/history', label: 'Inquiry History', icon: History },
];

export default function PharmacistLayout() {
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
  )?.label || 'Medical Portal';

  return (
    <div className="min-h-screen relative bg-slate-50 overflow-x-hidden font-sans">
      <div className="relative z-10 flex min-h-screen">
        
        {/* SIDEBAR (Desktop) */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 z-30 h-screen fixed top-0 left-0">
          <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
            {/* Professional Brand */}
            <div className="p-8 pb-10 flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/10">
                <Stethoscope size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 font-outfit leading-none">PharmaBoy</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mt-1">Medical Portal</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
              <div className="px-4 mb-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Decision Hub</p>
              </div>
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all group ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-600'} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Profile / Logout */}
            <div className="p-6 mt-auto border-t border-slate-100 bg-slate-50/30">
              <div className="px-2 pb-6 flex items-center gap-3">
                <div className="h-9 w-9 bg-white rounded-lg flex items-center justify-center text-indigo-600 border border-slate-200 shadow-sm">
                   <Activity size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{user?.name}</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all group border border-transparent hover:border-rose-100"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* MOBILE HEADER */}
        <header className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-6">
           <div className="flex items-center gap-3">
              <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/10">
                 <Stethoscope size={18} strokeWidth={2.5} />
              </div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 font-outfit">PharmaBoy</h1>
           </div>
           
           <button 
              onClick={handleLogout}
              className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all active:scale-95 border border-rose-100/50"
           >
              <LogOut size={18} />
           </button>
        </header>

        {/* MAIN AREA */}
        <main className="flex-1 lg:ml-64 min-w-0 overflow-x-hidden">
          <div className="p-4 md:p-8 lg:p-12 pt-28 md:pt-32 lg:pt-12 min-h-screen">
            <div className="max-w-[1400px] mx-auto w-full relative">
              <Outlet />
            </div>
          </div>
          <div className="h-28 lg:hidden" />
        </main>

        {/* BOTTOM NAV (Mobile) */}
        <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-20 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl z-40 flex items-center justify-around px-2 border border-slate-200">
           {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 transition-all duration-300 w-full ${
                  isActive ? 'text-indigo-600 scale-105' : 'text-slate-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-indigo-50 shadow-inner' : ''}`}>
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest">{item.label.split(' ')[0]}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
