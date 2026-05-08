import { useState, useEffect } from 'react';
import { apiRequest } from '../../../api/client';
import { 
  Package, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Calendar, 
  Bike,
  Building2
} from 'lucide-react';

export default function OrderTracking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); 

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await apiRequest('/orders/customer');
      setOrders(res.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'PENDING': { color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400', border: 'border-slate-200', label: 'Processing', icon: Clock },
      'CONFIRMED': { color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500', border: 'border-blue-100', label: 'Confirmed', icon: CheckCircle2 },
      'PREPARING': { color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500', border: 'border-amber-100', label: 'In Lab', icon: Clock },
      'DISPATCHED': { color: 'bg-teal-50 text-teal-700', dot: 'bg-teal-500', border: 'border-teal-100', label: 'On Way', icon: Truck },
      'DELIVERED': { color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-100', label: 'Filled', icon: CheckCircle2 },
      'CANCELLED': { color: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500', border: 'border-rose-100', label: 'Cancelled', icon: XCircle },
    };
    return configs[status] || configs['PENDING'];
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'ACTIVE') return o.status !== 'DELIVERED' && o.status !== 'CANCELLED';
    if (filter === 'PAST') return o.status === 'DELIVERED' || o.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="animate-fade-in space-y-8 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Dispatch</h2>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Real-time fulfillment lane monitoring</p>
        </div>

        <div className="flex bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/50">
          {['ALL', 'ACTIVE', 'PAST'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-white text-slate-900 shadow-md translate-y-[-1px]' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
           {Array(2).fill(0).map((_, i) => (
             <div key={i} className="bg-slate-50/50 border border-slate-100 rounded-3xl h-64 animate-pulse"></div>
           ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-100 rounded-3xl p-24 text-center">
           <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-8 text-slate-200">
              <Package size={40} />
           </div>
           <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Shipments</h3>
           <p className="text-slate-400 font-medium max-w-sm mx-auto">Your clinical fulfillment queue is empty. Active orders will appear here during the verification phase.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {filteredOrders.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map((order) => (
            <div key={order.id} className="relative">
              {/* Order Header / Background Mask */}
              <div className="flex items-center justify-between mb-6 px-4">
                 <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-full tracking-widest uppercase">Order #ORD-{order.id}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logged {new Date(order.createdAt).toLocaleDateString()}</span>
                 </div>
                 <div className="text-right">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Authorization Value</span>
                    <p className="text-xl font-black text-slate-900">Rs. {Number(order.totalAmount).toFixed(2)}</p>
                 </div>
              </div>

              {/* SHIPMENT LANES (Fulfillments) */}
              <div className="space-y-4">
                {order.fulfillments?.map((fulfillment) => {
                  const config = getStatusConfig(fulfillment.status);
                  return (
                    <div 
                      key={fulfillment.id}
                      className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden"
                    >
                      <div className="flex flex-col lg:flex-row gap-8 justify-between lg:items-center">
                        {/* LEFT: PHARMACY SOURCE */}
                        <div className="flex-shrink-0 min-w-[240px]">
                           <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-4 border ${config.color} ${config.border}`}>
                              <config.icon size={12} />
                              {config.label}
                           </div>
                           <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                              <Building2 size={20} className="text-slate-300" />
                              {fulfillment.pharmacy?.name}
                           </h4>
                           <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                              <MapPin size={12} />
                              <p className="text-[10px] font-black uppercase tracking-widest">Fulfillment Center | {fulfillment.pharmacy?.city}</p>
                           </div>
                        </div>

                        {/* CENTER: MEDICINES */}
                        <div className="flex-1 flex flex-wrap gap-3 py-4 lg:py-0 lg:border-x border-slate-50 lg:px-8">
                           {fulfillment.items?.map((item, idx) => (
                             <div key={idx} className="bg-slate-50/80 border border-slate-100/50 px-4 py-2 rounded-xl flex items-center gap-3">
                                <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-700 text-[10px] font-black flex items-center justify-center">{item.quantity}</span>
                                <div className="flex flex-col">
                                   <span className="text-[10px] font-black text-slate-700 uppercase leading-none">{item.medicine?.name}</span>
                                   <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{item.medicine?.strength} {item.medicine?.form}</span>
                                </div>
                             </div>
                           ))}
                        </div>

                        {/* RIGHT: LOGISTICS & RIDER */}
                        <div className="flex-shrink-0 lg:w-48 flex flex-col items-end gap-4">
                           {fulfillment.rider ? (
                              <div className="bg-teal-600 text-white rounded-2xl p-4 w-full relative overflow-hidden shadow-lg">
                                 <div className="relative z-10 flex items-center gap-3">
                                    <div className="p-2 bg-teal-500 rounded-lg">
                                       <Bike size={20} />
                                    </div>
                                    <div>
                                       <p className="text-[8px] font-black text-teal-100 uppercase tracking-widest mb-0.5">Live Courier</p>
                                       <p className="text-xs font-black text-white">{fulfillment.rider.user?.name}</p>
                                    </div>
                                 </div>
                                 <Truck size={60} className="absolute -right-4 -bottom-4 text-teal-500 opacity-30 transform rotate-12" />
                              </div>
                           ) : (
                              <div className="bg-slate-50 rounded-2xl p-4 w-full flex flex-col items-center justify-center text-center group">
                                 <Clock size={20} className="text-slate-300 mb-2 group-hover:animate-spin-slow" />
                                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Allocating Courier</span>
                              </div>
                           )}
                           
                           <div className="text-right w-full px-2">
                              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-0.5">Lane Subtotal</span>
                              <p className="text-base font-black text-slate-900 tabular-nums leading-none">Rs. {Number(fulfillment.subtotal).toFixed(2)}</p>
                           </div>
                        </div>
                      </div>

                      {/* Progress Bar for the specific fulfillment */}
                      <div className="mt-8 h-1.5 bg-slate-50 rounded-full overflow-hidden relative">
                         <div 
                          className={`h-full bg-teal-500 transition-all duration-1000 ease-in-out relative`}
                          style={{ width: 
                            fulfillment.status === 'DELIVERED' ? '100%' : 
                            fulfillment.status === 'DISPATCHED' ? '75%' : 
                            fulfillment.status === 'PREPARING' ? '50%' : 
                            fulfillment.status === 'CONFIRMED' ? '30%' :
                            fulfillment.status === 'PENDING' ? '15%' : '0%'
                          }}
                         >
                            {fulfillment.status !== 'DELIVERED' && (
                               <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-r from-transparent to-white/20 animate-shimmer"></div>
                            )}
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Lane Connectors (Visual) */}
              <div className="absolute left-[-24px] top-[40px] bottom-6 w-1 border-l-2 border-dashed border-slate-200 hidden xl:block"></div>
            </div>
          ))}
        </div>
      )}

      {/* FOOTER INFO */}
      <div className="bg-slate-900 rounded-3xl p-10 mt-12 overflow-hidden relative">
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
               <h4 className="text-xl font-black text-white mb-2">Clinical Fulfillment Transparency</h4>
               <p className="text-slate-400 text-sm font-medium">Pharmacy Boy uses a split-dispatch logistics model. Each pharmacy confirms, prepares, and dispatches their portion of your quote independently to ensure maximum clinical speed.</p>
            </div>
            <div className="flex gap-4">
               <div className="text-center">
                  <p className="text-2xl font-black text-teal-400 leading-none mb-1">{orders.length}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Quotes</p>
               </div>
               <div className="w-[1px] h-10 bg-slate-800 self-center"></div>
               <div className="text-center">
                  <p className="text-2xl font-black text-white leading-none mb-1">{orders.filter(o => o.status === 'DELIVERED').length}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Successful Shipments</p>
               </div>
            </div>
         </div>
         <Package size={200} className="absolute -right-20 -bottom-20 text-white/5 transform -rotate-12" />
      </div>
    </div>
  );
}
