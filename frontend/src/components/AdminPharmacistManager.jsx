import { useState } from 'react';
import { apiRequest } from '../api/client';
import { 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function AdminPharmacistManager() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await apiRequest('/admin/pharmacist', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setSuccess(res.message);
      setForm({ name: '', email: '', password: '', phone: '' });
    } catch (err) {
      setError(err.message || 'Failed to create pharmacist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
               <ShieldCheck size={24} />
            </div>
            <div>
               <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Central Pharmacist Gateway</h3>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Authorized Administrative Access Only</p>
            </div>
         </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
         {/* Instruction Panel */}
         <div className="space-y-6">
            <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <UserPlus size={60} />
               </div>
               <h4 className="font-black text-indigo-900 uppercase text-xs tracking-[0.2em] mb-4">Operational Protocol</h4>
               <p className="text-sm text-indigo-800 leading-relaxed font-medium">
                  Use this console to establish the **Primary Clinical Authority** for the platform. This pharmacist will automatically receive and process all clinical documentation uploaded by patients.
               </p>
            </div>

            <div className="flex items-center gap-4 p-4 border border-emerald-100 bg-emerald-50/30 rounded-2xl">
               <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
               <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-relaxed">
                  Automatic Routing Protocol is active. All system flows are unified under this credential.
               </p>
            </div>

            {success && (
               <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 animate-bounce">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">{success}</p>
               </div>
            )}

            {error && (
               <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3">
                  <AlertCircle size={18} className="text-rose-600" />
                  <p className="text-xs font-black text-rose-700 uppercase tracking-widest">{error}</p>
               </div>
            )}
         </div>

         {/* Entry Form */}
         <form onSubmit={handleCreate} className="space-y-5">
            <div className="space-y-4">
               <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input 
                    name="name" required value={form.name} onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-900 text-sm placeholder:text-slate-300"
                    placeholder="Full Professional Name"
                  />
               </div>

               <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input 
                    name="email" type="email" required value={form.email} onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-900 text-sm placeholder:text-slate-300"
                    placeholder="Credential Email Address"
                  />
               </div>

               <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input 
                    name="phone" required value={form.phone} onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-900 text-sm placeholder:text-slate-300"
                    placeholder="Encrypted Contact Number"
                  />
               </div>

               <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input 
                    name="password" type="password" required value={form.password} onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-900 text-sm placeholder:text-slate-300"
                    placeholder="Security Passcode"
                  />
               </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
               {loading ? <Loader2 className="animate-spin" size={16} /> : <>Register Primary Authority</>}
            </button>
         </form>
      </div>
    </div>
  );
}
