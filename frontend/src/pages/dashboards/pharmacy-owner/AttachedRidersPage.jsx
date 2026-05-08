import { useState, useEffect } from 'react';
import { apiRequest } from '../../../api/client';
import { 
  Users,
  Bike,
  Package,
  Truck,
  CheckCircle2,
  Loader,
  X,
  UserPlus,
  Mail,
  Lock,
  Phone,
  ChevronRight
} from 'lucide-react';

export default function AttachedRidersPage() {
  const [riders, setRiders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Registration form state
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', phone: '', vehicleType: 'Bike', vehicleNumber: '' });
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ridersRes, ordersRes] = await Promise.all([
        apiRequest('/pharmacy-owner/affiliated-riders'),
        apiRequest('/pharmacy-owner/orders')
      ]);
      setRiders(ridersRes.riders || []);
      setOrders(ordersRes.fulfillments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (riderId) => {
    try {
      await apiRequest(`/pharmacy-owner/fulfillment/${assigningOrder.id}/assign-rider`, {
        method: 'POST',
        body: JSON.stringify({ riderId })
      });
      setAssigningOrder(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegisterRider = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await apiRequest('/pharmacy-owner/register-rider', {
        method: 'POST',
        body: JSON.stringify(regForm)
      });
      setSuccess(`Rider "${regForm.name}" registered! They can login with: ${regForm.email}`);
      setRegForm({ name: '', email: '', password: '', phone: '', vehicleType: 'Bike', vehicleNumber: '' });
      setShowRegisterForm(false);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setRegLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader className="animate-spin text-indigo-600" size={32} />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fleet Management</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Register riders & assign deliveries</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-900 text-white rounded-2xl px-6 py-4 items-center gap-6 shadow-xl">
             <div className="text-center">
                <p className="text-xl font-black leading-none">{riders.length}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Fleet</p>
             </div>
             <div className="w-[1px] h-6 bg-slate-700"></div>
             <div className="text-center">
                <p className="text-xl font-black text-teal-400 leading-none">
                  {orders.filter(o => o.status === 'PREPARING' || o.status === 'DISPATCHED').length}
                </p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Active</p>
             </div>
          </div>
          <button onClick={() => setShowRegisterForm(true)} className="px-6 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2">
             <UserPlus size={16} /> New Rider
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between text-rose-600 text-sm font-bold">
           <span>{error}</span>
           <button onClick={() => setError('')}><X size={16} /></button>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between text-emerald-700 text-sm font-bold">
           <span>{success}</span>
           <button onClick={() => setSuccess('')}><X size={16} /></button>
        </div>
      )}

      {/* RIDERS FLEET */}
      <section>
        <div className="flex items-center gap-2 mb-6">
           <Users size={16} className="text-indigo-600" />
           <h2 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">Registered Riders</h2>
        </div>
        
        {riders.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
             <Bike size={32} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">No riders registered yet</p>
             <button onClick={() => setShowRegisterForm(true)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-600 transition-all">
                Register Your First Rider
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {riders.map(r => (
              <div key={r.id} className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-all group">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-teal-600 group-hover:text-white transition-all">
                       <Truck size={18} />
                    </div>
                    <div>
                       <h4 className="font-black text-slate-900 leading-none mb-1">{r.user.name}</h4>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                         {r.vehicleType || 'N/A'} {r.vehicleNumber ? `• ${r.vehicleNumber}` : ''}
                       </p>
                    </div>
                 </div>
                 <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                    <p className="flex items-center gap-2"><Mail size={12} /> {r.user.email}</p>
                    {r.user.phone && <p className="flex items-center gap-2"><Phone size={12} /> {r.user.phone}</p>}
                 </div>
                 <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Status</span>
                    <span className="text-emerald-500 flex items-center gap-1">
                       <CheckCircle2 size={10} /> Active
                    </span>
                 </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ORDER QUEUE */}
      <section>
        <div className="flex items-center gap-2 mb-6">
           <Package size={16} className="text-indigo-600" />
           <h2 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">Delivery Queue</h2>
        </div>

        {orders.filter(o => o.status !== 'DELIVERED').length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
             <CheckCircle2 size={32} className="mx-auto text-teal-100 mb-4" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">All deliveries are up to date</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-x-auto">
             <table className="w-full text-left min-w-[600px]">
                <thead>
                   <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-6 py-5">Order</th>
                      <th className="px-6 py-5">Customer</th>
                      <th className="px-6 py-5">Status</th>
                      <th className="px-6 py-5">Rider</th>
                      <th className="px-6 py-5 text-right">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {orders.filter(o => o.status !== 'DELIVERED').map(o => (
                     <tr key={o.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-6 py-5 text-sm font-black text-slate-900">#ORD-{o.order.id}</td>
                        <td className="px-6 py-5">
                           <p className="text-sm font-bold text-slate-800 leading-none">{o.order.customer.user.name}</p>
                           <p className="text-[10px] text-slate-400 font-bold tracking-tight mt-1">{o.order.deliveryAddress}</p>
                        </td>
                        <td className="px-6 py-5">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             o.status === 'PREPARING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                             o.status === 'DISPATCHED' ? 'bg-teal-50 text-teal-700 border-teal-100' :
                             o.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                             'bg-slate-100 text-slate-500 border-slate-200'
                           }`}>
                             {o.status}
                           </span>
                        </td>
                        <td className="px-6 py-5">
                           {o.rider ? (
                              <div className="flex items-center gap-2">
                                 <Bike size={14} className="text-slate-300" />
                                 <p className="text-xs font-bold text-slate-700">{o.rider.user.name}</p>
                              </div>
                           ) : (
                              <p className="text-xs font-bold text-rose-500 italic">Unassigned</p>
                           )}
                        </td>
                        <td className="px-6 py-5 text-right">
                           {!o.rider ? (
                              <button onClick={() => setAssigningOrder(o)} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-teal-600 transition-all">
                                 Assign
                              </button>
                           ) : (
                              <CheckCircle2 size={16} className="ml-auto text-emerald-500" />
                           )}
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}
      </section>

      {/* REGISTER RIDER MODAL */}
      {showRegisterForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative">
              <button onClick={() => setShowRegisterForm(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-all">
                 <X size={24} />
              </button>
              
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white">
                    <UserPlus size={20} />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900">Register New Rider</h3>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">This rider will be linked to your pharmacy</p>

              <form onSubmit={handleRegisterRider} className="space-y-5">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">Full Name *</label>
                       <input type="text" required value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} placeholder="Ahmed Khan" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-teal-500 transition-all" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">Phone</label>
                       <input type="tel" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} placeholder="0300-1234567" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-teal-500 transition-all" />
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">Email Address *</label>
                    <input type="email" required value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} placeholder="rider@example.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-teal-500 transition-all" />
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">Password *</label>
                    <input type="password" required minLength={6} value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} placeholder="Min 6 characters" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-teal-500 transition-all" />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">Vehicle Type</label>
                       <select value={regForm.vehicleType} onChange={e => setRegForm({...regForm, vehicleType: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-teal-500 transition-all">
                          <option value="Bike">Bike</option>
                          <option value="Car">Car</option>
                          <option value="Van">Van</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">Vehicle Number</label>
                       <input type="text" value={regForm.vehicleNumber} onChange={e => setRegForm({...regForm, vehicleNumber: e.target.value})} placeholder="ABC-123" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-teal-500 transition-all uppercase" />
                    </div>
                 </div>

                 <button type="submit" disabled={regLoading} className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/20 mt-4">
                    {regLoading ? 'Registering...' : 'Register Rider'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* ASSIGNMENT MODAL */}
      {assigningOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative">
              <button onClick={() => setAssigningOrder(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={24} /></button>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Assign Rider</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Order #ORD-{assigningOrder.order.id}</p>
              
              <div className="space-y-3 mb-8">
                 {riders.map(r => (
                   <button key={r.id} onClick={() => handleAssign(r.id)} className="w-full p-4 border-2 border-slate-100 rounded-2xl flex items-center justify-between hover:border-teal-500 hover:bg-teal-50 transition-all font-bold text-slate-700">
                      <div className="text-left">
                         <p className="text-sm font-black text-slate-800">{r.user.name}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase">{r.vehicleType || 'Bike'}</p>
                      </div>
                      <ChevronRight size={18} className="text-slate-200" />
                   </button>
                 ))}
                 {riders.length === 0 && (
                   <div className="py-8 text-center">
                      <p className="text-sm font-bold text-slate-400 italic mb-4">No riders registered yet</p>
                      <button onClick={() => { setAssigningOrder(null); setShowRegisterForm(true); }} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                         Register a Rider First
                      </button>
                   </div>
                 )}
              </div>

              <button onClick={() => setAssigningOrder(null)} className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-900 transition-all">
                 Cancel
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
