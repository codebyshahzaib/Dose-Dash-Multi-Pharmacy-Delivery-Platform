import { useState, useEffect } from 'react';
import { apiRequest } from '../../../api/client';
import { 
  UserCheck, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  X,
  Mail,
  Lock,
  Activity,
  UserX
} from 'lucide-react';

export default function AdminPharmacists() {
  const [pharmacists, setPharmacists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchPharmacists();
  }, []);

  const fetchPharmacists = async () => {
    try {
      const res = await apiRequest('/admin/users?role=PHARMACIST');
      setPharmacists(res.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await apiRequest('/admin/pharmacist', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setMessage({ type: 'success', text: 'New medical authority registered successfully.' });
      setFormData({ name: '', email: '', password: '' });
      setShowAddForm(false);
      fetchPharmacists();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Registration failed.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    setProcessing(true);
    try {
      await apiRequest(`/admin/users/${id}`, { method: 'DELETE' });
      setMessage({ type: 'success', text: 'Authority decommissioned and removed from system.' });
      setPharmacists(prev => prev.filter(p => p.id !== id));
      setDeleteId(null);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Deletion failed.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleSetPrimary = async (pharmacistProfileId) => {
    setProcessing(true);
    try {
      await apiRequest(`/admin/pharmacists/${pharmacistProfileId}/primary`, { method: 'PATCH' });
      setMessage({ type: 'success', text: 'Master Routing Updated: This pharmacist now receives all new requests.' });
      fetchPharmacists();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update routing authority.' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-8 gap-6">
         <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Medical Authorities</h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">Manage licensed pharmacists authorized for centralized prescription verification.</p>
         </div>
         <button 
           onClick={() => setShowAddForm(true)}
           className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-900/10 flex items-center justify-center gap-3"
         >
           <Plus size={16} />
           Register New Authority
         </button>
      </div>

      {message && (
        <div className={`p-6 rounded-2xl text-sm font-bold border flex items-center justify-between animate-fade-in ${
          message.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
        }`}>
          <div className="flex items-center gap-3 uppercase tracking-widest text-[10px] font-black">
            <ShieldCheck size={18} />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Authority Grid */}
      <div className="grid grid-cols-1 gap-6">
         {loading ? (
            Array(2).fill(0).map((_, i) => <div key={i} className="h-24 bg-white border border-slate-200 animate-pulse rounded-3xl"></div>)
         ) : pharmacists.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-24 text-center">
               <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <UserX size={40} />
               </div>
               <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Zero Clinical Staff</h3>
               <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto mt-2 italic">The platform currently lacks a centralized pharmaceutical authority. Register a pharmacist to enable fulfillment.</p>
            </div>
         ) : (
            pharmacists.map(p => (
               <div key={p.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 group hover:border-indigo-300 hover:shadow-xl transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner border border-slate-100">
                        <UserCheck size={28} />
                     </div>
                     <div>
                        <div className="flex items-center gap-3 mb-2">
                           <h4 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{p.name}</h4>
                           <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                              Authorized
                           </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-6">
                           <div className="flex items-center gap-2 text-slate-400">
                              <Mail size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">{p.email}</span>
                           </div>
                           <div className="flex items-center gap-2 text-slate-400">
                              <Activity size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Added {new Date(p.createdAt).toLocaleDateString()}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-4">
                     {!p.pharmacist?.isPrimary ? (
                        <button 
                           onClick={() => handleSetPrimary(p.pharmacist?.id)}
                           disabled={processing}
                           className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all border border-slate-200"
                        >
                           Make Primary
                        </button>
                     ) : (
                        <div className="px-6 py-3 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                           <Activity size={14} />
                           Primary Authority
                        </div>
                     )}

                     <button 
                        onClick={() => setDeleteId(p.id)}
                        className="h-14 w-14 flex items-center justify-center text-slate-400 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                     >
                        <Trash2 size={20} />
                     </button>
                  </div>
               </div>
            ))
         )}
      </div>

      {/* REGISTRATION MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-[2.5rem] w-full max-w-lg border border-slate-200 shadow-2xl relative overflow-hidden">
              <div className="p-10 pt-12">
                 <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Authority Registration</h3>
                    <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-900 transition-colors"><X size={24} /></button>
                 </div>

                 <form onSubmit={handleCreate} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Authorized Name</label>
                       <div className="relative">
                          <input 
                            required
                            type="text" 
                            placeholder="Dr. Full Name"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-600 transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Secure Email Address</label>
                       <div className="relative">
                          <input 
                            required
                            type="email" 
                            placeholder="pharmacist@hospital.com"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-600 transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">System Access Key</label>
                       <div className="relative">
                          <input 
                            required
                            type="password" 
                            placeholder="••••••••"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-600 transition-all"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          />
                       </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={processing}
                      className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] font-outfit mt-4 hover:bg-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                    >
                       {processing ? 'Processing Registration...' : 'Authorize Authority'}
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border border-slate-200">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-rose-100">
                 <UserX size={32} />
              </div>
              <h3 className="text-xl font-bold text-center text-slate-900 mb-2 uppercase tracking-tight">Revoke Authority?</h3>
              <p className="text-center text-slate-500 font-medium text-sm leading-relaxed mb-10">This will permanently terminate this pharmacist's system access and archive all clinical records.</p>
              
              <div className="flex flex-col gap-3">
                 <button 
                   onClick={() => handleDelete(deleteId)}
                   disabled={processing}
                   className="w-full py-5 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all active:scale-95 shadow-xl shadow-rose-200"
                 >
                    {processing ? 'Revoking Access...' : 'Confirm Termination'}
                 </button>
                 <button 
                   onClick={() => setDeleteId(null)}
                   disabled={processing}
                   className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                 >
                    Keep Authority
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
