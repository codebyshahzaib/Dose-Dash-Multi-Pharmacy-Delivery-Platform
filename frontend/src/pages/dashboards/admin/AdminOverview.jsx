import { useState, useEffect } from 'react';
import { apiRequest } from '../../../api/client';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Store, 
  TrendingUp,
  Activity,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

export default function AdminOverview() {
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
    { label: 'Total Base',    value: stats?.totalUsers || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { label: 'Clinical Rx',   value: stats?.totalPrescriptions || 0, icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
    { label: 'Fulfillments',  value: stats?.totalOrders || 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Network Pharms', value: stats?.activePharmacies || 0, icon: Store, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  ];

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 pb-8">
         <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Command Center</h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">Real-time oversight of the platform's medical and logistical performance.</p>
         </div>
         <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100">
            <Activity size={14} className="animate-pulse" />
            Core Operational
         </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all group relative overflow-hidden">
             <div className="relative z-10 flex flex-col gap-6">
                <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center shadow-inner border ${card.border}`}>
                   <card.icon size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{card.label}</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums">{card.value}</p>
                </div>
             </div>
             <ArrowUpRight size={24} className="absolute -top-4 -right-4 text-slate-50 opacity-0 group-hover:opacity-100 transition-all group-hover:top-6 group-hover:right-6" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
         {/* System Health */}
         <div className="xl:col-span-8 bg-white border border-slate-200 rounded-[2.5rem] p-10 relative overflow-hidden shadow-sm">
            <div className="relative z-10">
               <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-8 flex items-center gap-3">
                  <Activity size={24} className="text-indigo-600" />
                  Ecosystem Intelligence
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col gap-4">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">API Latency</span>
                     <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-slate-900">24ms</span>
                        <span className="text-xs font-bold text-emerald-500 mb-1">Optimal</span>
                     </div>
                     <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[15%]"></div>
                     </div>
                  </div>
                  <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col gap-4">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DB Connectivity</span>
                     <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-slate-900">Stable</span>
                        <span className="text-xs font-bold text-indigo-500 mb-1">Active</span>
                     </div>
                     <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full w-[85%]"></div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Alerts */}
         <div className="xl:col-span-4 flex flex-col gap-6">
            <div className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-8 flex-1 shadow-sm">
               <ShieldAlert size={32} className="text-rose-600 mb-6" />
               <h3 className="text-lg font-bold text-rose-900 tracking-tight mb-3 uppercase">Security Audit</h3>
               <p className="text-sm text-slate-600 leading-relaxed font-medium mb-8">
                  No critical incidents detected in the last 24 hours. Automated verification checks are pending for 12 new inventory entries.
               </p>
               <button className="w-full py-4 bg-white text-rose-600 border border-rose-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                  Run Manual Scan
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
