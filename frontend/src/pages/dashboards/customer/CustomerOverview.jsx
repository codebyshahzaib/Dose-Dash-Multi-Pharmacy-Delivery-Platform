import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../../api/client';
import { 
  Plus, 
  Package, 
  ClipboardList, 
  History, 
  ArrowRight,
  Sparkles,
  Clock,
  X
} from 'lucide-react';

export default function CustomerOverview() {
  const [stats, setStats] = useState({
    activeOrders: 0,
    pendingProposals: 0,
    historyCount: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [rxRes, propRes, orderRes] = await Promise.all([
        apiRequest('/prescriptions/my'),
        apiRequest('/proposals/customer'),
        apiRequest('/orders/customer').catch(() => ({ orders: [] }))
      ]);

      const pendingProposals = propRes.proposals?.filter(p => p.status === 'PENDING').length || 0;
      const activeOrders = orderRes.orders?.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length || 0;

      setStats({
        activeOrders,
        pendingProposals,
        historyCount: rxRes.prescriptions?.length || 0
      });

      setRecentRequests(rxRes.prescriptions?.slice(0, 3) || []);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  };

  const [withdrawId, setWithdrawId] = useState(null);

  const handleWithdraw = async (id) => {
    setProcessing(true);
    try {
      await apiRequest(`/prescriptions/${id}`, { method: 'DELETE' });
      setRecentRequests(prev => prev.filter(r => r.id !== id));
      setStats(prev => ({ ...prev, historyCount: Math.max(0, prev.historyCount - 1) }));
      setWithdrawId(null);
    } catch (err) {
      alert(err.message || 'Failed to withdraw application.');
    } finally {
      setProcessing(false);
    }
  };

  const CARDS = [
    { label: 'Active Deliveries', value: stats.activeOrders, icon: Package, color: 'from-[#10b981] to-[#059669]', to: '/customer/orders' },
    { label: 'Unreviewed Quotes', value: stats.pendingProposals, icon: ClipboardList, color: 'from-[#f59e0b] to-[#d97706]', to: '/customer/proposals' },
    { label: 'Request History', value: stats.historyCount, icon: History, color: 'from-[#6366f1] to-[#4f46e5]', to: '/customer/orders' },
  ];

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Personal Repository</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time oversight of your medical applications and order status.</p>
        </div>
        <button 
          onClick={() => navigate('/customer/upload')}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-teal-600 transition-all shadow-md active:scale-95 flex items-center gap-2"
        >
          <Plus size={16} />
          New Application
        </button>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CARDS.map((card, i) => (
          <div 
            key={i} 
            onClick={() => navigate(card.to)}
            className="group cursor-pointer bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-200 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-sm`}>
                <card.icon size={22} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{card.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                  {loading ? '...' : card.value}
                </h3>
              </div>
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-teal-600 transition-colors" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* RECENT REQUESTS */}
        <section className="xl:col-span-8 bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                 <ClipboardList size={20} className="text-teal-600" />
                 Recent Medical Applications
              </h3>
              <p className="text-sm text-slate-500 mt-1">Monitor the status of your active prescriptions.</p>
            </div>
          </div>
          
          <div className="space-y-4">
             {loading ? (
               Array(3).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-slate-50 h-20 rounded-lg"></div>)
             ) : recentRequests.length === 0 ? (
               <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-12 text-center">
                  <p className="text-slate-400 font-medium italic text-sm">No activity recorded.</p>
               </div>
             ) : (
               recentRequests.map((rx) => (
                 <div key={rx.id} className="bg-white border border-slate-100 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between hover:border-teal-200 transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all">
                        <Clock size={18} />
                      </div>
                      <div>
                         <p className="font-bold text-slate-800 text-sm">
                           {typeof rx.pharmacist === 'object' ? (rx.pharmacist?.user?.name || 'Primary Pharmacist') : rx.pharmacist}
                         </p>
                         <p className="text-[11px] font-bold text-teal-600 mt-0.5">#{rx.id}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-6 mt-4 sm:mt-0">
                      <div className="text-right hidden sm:block">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date Logged</p>
                         <p className="text-xs font-bold text-slate-600">{new Date(rx.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        rx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                        rx.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {rx.status}
                      </div>
                      
                      {rx.status === 'PENDING' && (
                        <button 
                          onClick={() => setWithdrawId(rx.id)}
                          className="bg-white text-rose-500 p-2 rounded-lg hover:bg-rose-50 transition-all border border-slate-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      )}
                   </div>
                 </div>
               ))
             )}
          </div>
        </section>

        {/* PRO TIPS AREA */}
        <section className="xl:col-span-4 flex flex-col gap-6">
           <div className="bg-slate-900 rounded-xl p-8 text-white relative overflow-hidden shadow-lg flex-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 opacity-20 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
              
              <div className="relative z-10 h-full flex flex-col">
                 <Sparkles size={20} className="text-teal-400 mb-6" />
                 
                 <h3 className="text-lg font-bold mb-3 tracking-tight">Price Optimization</h3>
                 <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8">
                    Specify generic alternatives in your fulfillment notes to save up to 40% on prescriptions.
                 </p>
                 
                 <button 
                   onClick={() => navigate('/customer/upload')}
                   className="mt-auto w-full bg-teal-500 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all active:scale-95 shadow-sm"
                 >
                   New Request
                 </button>
              </div>
           </div>
        </section>
      </div>

      {/* WITHDRAWAL MODAL */}
      {withdrawId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl border border-slate-200">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center mx-auto mb-6">
                 <X size={24} />
              </div>
              <h3 className="text-lg font-bold text-center text-slate-800 mb-2">Withdraw Request?</h3>
              <p className="text-center text-slate-500 font-medium text-sm leading-relaxed mb-8">This will permanently delete your medical application and all associated partner responses.</p>
              
              <div className="flex flex-col gap-2">
                 <button 
                   onClick={() => handleWithdraw(withdrawId)}
                   disabled={processing}
                   className="w-full py-3 bg-rose-500 text-white rounded-lg font-bold text-sm hover:bg-rose-600 transition-all active:scale-95 shadow-md flex items-center justify-center"
                 >
                    {processing ? 'Processing...' : 'Confirm Withdrawal'}
                 </button>
                 <button 
                   onClick={() => setWithdrawId(null)}
                   disabled={processing}
                   className="w-full py-3 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-200 transition-all"
                 >
                    Keep Request
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
