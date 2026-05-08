import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Send, 
  ClipboardList, 
  Package, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon,
  Stethoscope,
  Activity
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/customer', label: 'Overview', icon: Home, end: true },
  { to: '/customer/upload', label: 'Submit Rx', icon: Send },
  { to: '/customer/prescriptions', label: 'Active RX', icon: Activity },
  { to: '/customer/proposals', label: 'Quotes', icon: ClipboardList },
  { to: '/customer/orders', label: 'Orders', icon: Package },
];

export default function CustomerLayout() {
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
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 z-30 h-screen fixed top-0 left-0 overflow-y-auto">
          <div className="flex flex-col h-full">
            {/* Professional Brand */}
            <div className="p-8 pb-10 flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/10">
                <Stethoscope size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 font-outfit leading-none">PharmaBoy</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mt-1">Medical Portal</p>
              </div>
            </div>

            {/* Navigation */}
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

            {/* Profile / Logout */}
            <div className="p-6 mt-auto border-t border-slate-100">
              <div className="px-2 pb-6 flex items-center gap-3">
                <div className="h-9 w-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                   <Activity size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{user?.email}</p>
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
            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-900 text-white">
              <Stethoscope size={16} />
            </div>
            <span className="font-bold text-slate-900 text-sm font-outfit uppercase tracking-widest">{activeLabel}</span>
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
             <nav className="space-y-2">
               {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-bold transition-all ${
                      isActive ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500'
                    }`
                  }
                >
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-12 pt-12 border-t border-slate-100">
               <button onClick={handleLogout} className="w-full py-5 rounded-2xl text-base font-bold text-rose-600 bg-rose-50 flex items-center justify-center gap-3">
                 <LogOut size={20} />
                 Sign Out
                </button>
            </div>
          </div>
        )}

        {/* MAIN AREA */}
        <main className="flex-1 lg:ml-64 p-6 pt-24 lg:pt-12 lg:p-12 min-h-screen max-w-[1400px] w-full mx-auto">
          <Outlet />
          <div className="h-28 lg:hidden" />
        </main>

        {/* BOTTOM NAV (Mobile) */}
        <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-20 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl z-40 flex items-center justify-around px-2 border border-slate-200">
           {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 transition-all duration-300 w-full ${
                  isActive ? 'text-teal-600 scale-105' : 'text-slate-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-teal-50 shadow-inner' : ''}`}>
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
