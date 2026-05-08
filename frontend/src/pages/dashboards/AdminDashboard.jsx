import { useState, useEffect } from 'react';
import DashboardShell from '../../components/DashboardShell';
import AdminPharmacistManager from '../../components/AdminPharmacistManager';
import { apiRequest } from '../../api/client';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Store, 
  TrendingUp,
  UserCheck,
  ShieldAlert
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await apiRequest('/admin/stats');
      setStats(res.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  const cards = [
    { label: 'Total Base',    value: stats?.totalUsers || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Clinical Rx',   value: stats?.totalPrescriptions || 0, icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Fulfillments',  value: stats?.totalOrders || 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Network Pharms', value: stats?.activePharmacies || 0, icon: Store, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <DashboardShell
      title="Administrative Command"
      subtitle="Ecosystem monitoring and authority management."
    >
      <div className="space-y-12 pb-20">
        
        {/* Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <div key={i} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
               <div className={`absolute top-0 right-0 w-32 h-32 ${card.bg} rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
               <div className="relative z-10 flex flex-col gap-6">
                  <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                     <card.icon size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">{card.value}</p>
                  </div>
               </div>
            </div>
          ))}
        </div>

        {/* Pharmacist Management Section */}
        <div className="space-y-6">
           <div className="flex items-center gap-3 ml-2">
              <UserCheck size={20} className="text-indigo-600" />
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Authority Management</h3>
           </div>
           <AdminPharmacistManager />
        </div>

        {/* Platform Alerts / Status */}
        <div className="bg-slate-950 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 p-10 opacity-10">
              <TrendingUp size={140} />
           </div>
           <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="max-w-xl">
                 <div className="flex items-center gap-2 text-emerald-400 mb-4 font-black uppercase text-[10px] tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    Core Systems Operational
                 </div>
                 <h3 className="text-3xl font-black tracking-tight mb-4">Platform Growth Index</h3>
                 <p className="text-slate-400 text-sm leading-relaxed">
                    The Pharmacy Boy ecosystem is scaling. Ensure all regulatory protocols are followed when adding new medical authorities. Automated audit logs are maintained for all administrative actions.
                 </p>
              </div>
              <div className="flex gap-4">
                 <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-xl">
                    Download Audit Log
                 </button>
                 <button className="px-8 py-4 bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all active:scale-95">
                    View Network Health
                 </button>
              </div>
           </div>
        </div>

        {/* User Activity / Security */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Access Control Logs</h3>
                 <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest underline underline-offset-4">Full Log Export</button>
              </div>
              <div className="space-y-4">
                 {[1,2,3].map(i => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm font-black text-xs">UX</div>
                          <div>
                             <p className="text-xs font-black text-slate-800 uppercase">System Session Initialized</p>
                             <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Admin-ID: 772 • 2 mins ago</p>
                          </div>
                       </div>
                       <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded uppercase">Authorized</span>
                    </div>
                 ))}
              </div>
           </div>
           
           <div className="bg-rose-50 rounded-[2.5rem] p-8 border border-rose-100 relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 bg-rose-200 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:scale-150 transition-all"></div>
              <ShieldAlert size={40} className="text-rose-600 mb-6" />
              <h3 className="text-lg font-black text-rose-900 uppercase tracking-tight mb-4">Security Lockdown</h3>
              <p className="text-sm text-rose-800 leading-relaxed font-medium mb-8">
                 Platform-wide emergency suspension module. Use only in case of catastrophic data breaches.
              </p>
              <button className="w-full py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-200">
                 Initiate Lockdown
              </button>
           </div>
        </div>
      </div>
    </DashboardShell>
  );
}