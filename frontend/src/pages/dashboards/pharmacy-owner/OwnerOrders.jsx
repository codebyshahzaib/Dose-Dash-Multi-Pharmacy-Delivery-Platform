import { useState, useEffect } from 'react';
import { apiRequest } from '../../../api/client';
import { Package, ArrowRight, User, Phone, MapPin, Clock } from 'lucide-react';

export default function OwnerOrders() {
  const [loading, setLoading] = useState(true);
  const [fulfillments, setFulfillments] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // In the New Schema, pharmacies track OrderFulfillment
      const res = await apiRequest('/orders/pharmacy');
      setFulfillments(res.fulfillments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (fulfillmentId, newStatus) => {
    try {
      await apiRequest(`/orders/fulfillments/${fulfillmentId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-8 max-w-7xl pb-12">
      <div className="flex items-center justify-between border-b border-slate-200 pb-8">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Active Deliveries</h2>
           <p className="text-sm text-slate-500 mt-1">Real-time prescription fulfillment and preparation queue.</p>
        </div>
        <div className="bg-amber-50 px-5 py-2.5 rounded-xl border border-amber-100 text-center shadow-sm">
           <span className="text-2xl font-bold text-amber-600 tabular-nums">
             {fulfillments.filter(f => f.status !== 'DELIVERED').length}
           </span>
           <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest ml-2">Active</span>
        </div>
      </div>

      <div className="space-y-6">
        {fulfillments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-20 text-center shadow-sm">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Package size={32} />
             </div>
             <p className="font-bold text-slate-500 uppercase tracking-widest text-sm">Queue is Clear</p>
             <p className="text-xs text-slate-400 mt-1 font-medium">No incoming orders require preparation.</p>
          </div>
        ) : (
          fulfillments.map(f => (
            <div key={f.id} className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 shadow-sm overflow-hidden relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50 group-hover:bg-indigo-50 transition-colors"></div>
               
               <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8 items-start lg:items-center">
                  <div className="flex items-center gap-6">
                     <div className="w-14 h-14 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-2xl shadow-inner text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                        {f.order.customer?.user?.name?.charAt(0) || 'C'}
                     </div>
                     <div>
                        <div className="flex items-center gap-3 mb-1">
                           <h4 className="font-bold text-slate-900 text-lg uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                              {f.order.customer?.user?.name}
                           </h4>
                           <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-[9px] font-bold text-slate-400 rounded-md tracking-widest uppercase">
                              Fulfillment #{f.id}
                           </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                           <div className="flex items-center gap-1.5 opacity-80">
                              <MapPin size={12} /> {f.order.deliveryAddress}
                           </div>
                           <div className="flex items-center gap-1.5 opacity-80">
                              <Phone size={12} /> {f.order.customer?.user?.phone || 'No phone'}
                           </div>
                           <div className="flex items-center gap-1.5 opacity-80">
                              <Clock size={12} /> {new Date(f.createdAt).toLocaleString()}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                     <div className="bg-slate-50/50 px-6 py-3 rounded-xl border border-slate-100 text-center group-hover:bg-white transition-colors">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Subtotal</span>
                        <span className="text-lg font-bold text-slate-900 tabular-nums uppercase tracking-tighter">Rs. {Number(f.subtotal).toFixed(0)}</span>
                     </div>
                     <div className="space-y-1.5">
                        {f.status === 'PENDING' && (
                          <button 
                            onClick={() => updateStatus(f.id, 'CONFIRMED')}
                            className="w-full sm:w-auto bg-slate-900 text-white px-8 py-3 rounded-lg font-bold text-[11px] uppercase tracking-widest hover:bg-emerald-600 shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                          >
                             CONFIRM ORDER
                             <ArrowRight size={14} />
                          </button>
                        )}
                        {f.status === 'CONFIRMED' && (
                          <button 
                            onClick={() => updateStatus(f.id, 'PREPARING')}
                            className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold text-[11px] uppercase tracking-widest hover:bg-indigo-700 shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                          >
                             START PREPARING
                             <ArrowRight size={14} />
                          </button>
                        )}
                         {f.status === 'PREPARING' && (
                          <button 
                            onClick={() => updateStatus(f.id, 'DISPATCHED')}
                            className="w-full sm:w-auto bg-amber-600 text-white px-8 py-3 rounded-lg font-bold text-[11px] uppercase tracking-widest hover:bg-amber-700 shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                          >
                             READY FOR RIDER
                             <ArrowRight size={14} />
                          </button>
                        )}
                        <div className="text-[9px] font-bold uppercase text-center tracking-widest text-indigo-600 py-1 bg-indigo-50 rounded-md border border-indigo-100">
                           {f.status}
                        </div>
                     </div>
                  </div>
               </div>

               {/* LINE ITEMS */}
               <div className="mt-8 pt-8 border-t border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Clinical Fulfillment Items</span>
                     <div className="flex-1 h-px bg-slate-100"></div>
                     <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-md">{f.items?.length || 0} Units</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                     {f.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-slate-50/30 p-4 rounded-xl border border-slate-100 group-hover:bg-white transition-all shadow-sm">
                           <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-bold shadow-md">
                              {item.quantity}x
                           </div>
                           <div className="min-w-0">
                               <p className="text-xs font-bold text-slate-800 uppercase truncate">
                                  {item.medicine?.name}
                               </p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase truncate tracking-tight mt-0.5">
                                  {item.medicine?.strength} • {item.medicine?.form}
                               </p>
                            </div>
                        </div>
                     ))}
                  </div>
               </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
