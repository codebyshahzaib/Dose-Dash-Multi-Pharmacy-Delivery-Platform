import { useState, useEffect } from 'react';
import { apiRequest } from '../../../api/client';
import {
  Building2,
  MapPin,
  Phone,
  Bike,
  Package,
  Truck,
  Clock,
  Briefcase,
  AlertCircle,
  XCircle,
  Loader
} from 'lucide-react';

export default function RiderOverview() {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentChecked, setPaymentChecked] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, ordersRes] = await Promise.all([
        apiRequest('/riders/profile'),
        apiRequest('/riders/orders')
      ]);
      setProfile(profileRes.profile);
      setOrders(ordersRes.fulfillments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, nextStatus) => {
    if (nextStatus === 'DELIVERED' && !paymentChecked[id]) {
      setError('Verify payment reception before finalizing delivery.');
      return;
    }
    setError('');
    setActionLoading(true);
    try {
      const endpoint = nextStatus === 'CONFIRMED' 
        ? `/riders/accept-order/${id}` 
        : `/riders/fulfillment/${id}/status`;
      
      const method = nextStatus === 'CONFIRMED' ? 'POST' : 'PUT';
      const body = nextStatus === 'CONFIRMED' ? null : JSON.stringify({ status: nextStatus });

      await apiRequest(endpoint, { method, body });
      const ordersRes = await apiRequest('/riders/orders');
      setOrders(ordersRes.fulfillments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader className="animate-spin text-teal-600" size={32} />
    </div>
  );

  const activeJobs = orders.filter(o => o.status !== 'DELIVERED');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary Banner */}
      <div className="bg-slate-900 rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
               <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Logistics Queue</h1>
               <p className="text-teal-400 font-bold text-xs uppercase tracking-widest leading-none">
                 {activeJobs.length} Priority Assignments Pending
               </p>
            </div>
            <div className="flex gap-4">
               <div className="bg-white/10 backdrop-blur-xl px-8 py-4 rounded-2xl border border-white/5 text-center min-w-[120px]">
                  <p className="text-3xl font-black text-white leading-none">{orders.length}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">Life Hits</p>
               </div>
               <div className="bg-teal-500 px-8 py-4 rounded-2xl text-center min-w-[120px] shadow-xl shadow-teal-500/20 text-white">
                  <p className="text-3xl font-black leading-none">{orders.filter(o => o.status === 'DELIVERED').length}</p>
                  <p className="text-[8px] font-black text-teal-100 uppercase tracking-widest mt-2">Closed</p>
               </div>
            </div>
         </div>
         <Truck size={200} className="absolute -right-10 -bottom-10 text-white/5 transform -rotate-12 pointer-events-none" />
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between text-rose-600 text-[10px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-3">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')}><XCircle size={14} /></button>
        </div>
      )}

      {/* Active Jobs Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
           <Briefcase size={16} className="text-teal-600" />
           <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">Active Mission Data</h3>
        </div>

        {activeJobs.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-24 text-center">
             <Package size={48} className="mx-auto text-slate-200 mb-6" />
             <p className="text-slate-400 font-black uppercase tracking-widest text-[11px]">Awaiting next clinical dispatch...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {activeJobs.map(o => (
              <div key={o.id} className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="flex flex-col xl:flex-row justify-between gap-10">
                  {/* Logistics Pathway */}
                  <div className="flex-1 space-y-8">
                     <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shrink-0">
                           <Building2 size={20} />
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Pickup Origin</p>
                           <h4 className="text-lg font-black text-slate-900 group-hover:text-teal-600 transition-colors">{o.pharmacy.name}</h4>
                           <p className="text-sm font-medium text-slate-500 mt-1">{o.pharmacy.address}</p>
                        </div>
                     </div>

                     <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all duration-500 shrink-0 shadow-inner">
                           <MapPin size={20} />
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-1 leading-none">Final Destination</p>
                           <h4 className="text-lg font-black text-slate-900">{o.order.customer.user.name}</h4>
                           <p className="text-sm font-medium text-slate-500 mt-1">{o.order.deliveryAddress}</p>
                           <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                              <Phone size={12} className="text-slate-400" />
                              <span className="text-xs font-bold text-slate-900">{o.order.customer.user.phone}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Operation Control */}
                  <div className="xl:w-80 bg-slate-50 rounded-[1.5rem] p-8 border border-slate-100 flex flex-col justify-between items-center text-center gap-8 shadow-inner">
                     <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Current Status</p>
                        <div className="flex items-center gap-3 justify-center px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
                           {o.status === 'PENDING' && <Clock size={14} className="text-amber-500" />}
                           {o.status === 'CONFIRMED' && <Package size={14} className="text-blue-500" />}
                           {o.status === 'DISPATCHED' && <Truck size={14} className="text-indigo-500" />}
                           <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{o.status}</span>
                        </div>
                     </div>

                     <div className="w-full space-y-4">
                        {o.status === 'PENDING' && (
                          <button onClick={() => handleAction(o.id, 'CONFIRMED')} disabled={actionLoading} className="w-full py-5 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/20 active:scale-95">
                             Accept Mission
                          </button>
                        )}
                        {o.status === 'CONFIRMED' && (
                          <button onClick={() => handleAction(o.id, 'DISPATCHED')} disabled={actionLoading} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-700 transition-all active:scale-95 shadow-xl shadow-slate-900/10">
                             Confirm Pickup
                          </button>
                        )}
                        {o.status === 'DISPATCHED' && (
                          <div className="space-y-5">
                             <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 group/box cursor-pointer" onClick={() => setPaymentChecked({...paymentChecked, [o.id]: !paymentChecked[o.id]})}>
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${paymentChecked[o.id] ? 'bg-teal-600 border-teal-600' : 'border-slate-200'}`}>
                                   {paymentChecked[o.id] && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight select-none">Payment Verified</span>
                             </div>
                             <button onClick={() => handleAction(o.id, 'DELIVERED')} disabled={actionLoading} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
                                Close Job
                             </button>
                          </div>
                        )}
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
