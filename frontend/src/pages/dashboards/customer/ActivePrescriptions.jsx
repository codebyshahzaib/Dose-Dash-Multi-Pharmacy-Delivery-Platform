import { useState, useEffect } from 'react';
import { apiRequest } from '../../../api/client';
import { 
  History, 
  Search, 
  X, 
  Clock, 
  FileText, 
  ShieldCheck, 
  AlertCircle,
  Activity,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ActivePrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState(false);
  const [withdrawId, setWithdrawId] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await apiRequest('/prescriptions/my');
      // Filter for non-terminal statuses
      const active = (res.prescriptions || []).filter(p => 
        ['PENDING', 'ASSIGNED', 'PROPOSED'].includes(p.status)
      );
      setPrescriptions(active);
    } catch (err) {
      console.error('Failed to fetch prescriptions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id) => {
    setProcessing(true);
    try {
      await apiRequest(`/prescriptions/${id}`, { method: 'DELETE' });
      setPrescriptions(prev => prev.filter(r => r.id !== id));
      setWithdrawId(null);
      setMessage({ type: 'success', text: 'Prescription withdrawn and deleted from queue.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Withdrawal failed.' });
    } finally {
      setProcessing(false);
    }
  };

  const filtered = prescriptions.filter(p => {
    const pharmacistName = typeof p.pharmacist === 'string' 
      ? p.pharmacist 
      : (p.pharmacist?.user?.name || 'Primary Pharmacist');

    return (
      p.id.toString().includes(searchTerm) || 
      pharmacistName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="animate-fade-in space-y-10 pb-12">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Active Medical Queue</h2>
          <p className="text-sm text-slate-500 mt-1">Status of clinical documentation undergoing centralized verification.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-bold border flex items-center justify-between animate-fade-in ${
          message.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
        }`}>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)}><X size={16} /></button>
        </div>
      )}

      {/* LIVE BADGE ONLY */}
      <div className="flex items-center gap-2">
         <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100 w-fit">
            <Activity size={14} />
            Live Queue Monitoring
         </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          Array(2).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-slate-50 h-32 rounded-3xl"></div>)
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-24 text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                <FileText size={40} />
             </div>
             <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Vault Empty</h3>
             <p className="text-slate-500 font-medium max-w-sm mx-auto text-sm leading-relaxed">No medical applications are currently in the verification pipeline. Use 'Submit Rx' to initialize a discovery.</p>
          </div>
        ) : (
          filtered.map(p => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all group">
               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner border border-slate-100">
                        <FileText size={28} />
                     </div>
                     <div>
                        <div className="flex items-center gap-3 mb-2">
                           <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">#{p.id}</h4>
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${
                             p.status === 'PROPOSED' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
                             p.status === 'ASSIGNED' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-600 border-slate-200'
                           }`}>
                             {p.status}
                           </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-6">
                           <div className="flex items-center gap-2">
                              <ShieldCheck size={14} className="text-emerald-500" />
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {typeof p.pharmacist === 'string' ? p.pharmacist : (p.pharmacist?.user?.name || 'Primary Pharmacist')}
                              </span>
                           </div>
                           <div className="flex items-center gap-2">
                              <Clock size={14} className="text-slate-400" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(p.createdAt).toLocaleDateString()}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-50">
                     {p.status === 'PROPOSED' && (
                       <button 
                         onClick={() => navigate('/customer/proposals')}
                         className="h-12 px-8 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-slate-900 transition-all flex items-center gap-2"
                       >
                          View Quote <ArrowRight size={14} />
                       </button>
                     )}
                     <button 
                       onClick={() => setWithdrawId(p.id)}
                       className="h-12 w-12 flex items-center justify-center text-rose-500 bg-white border border-rose-100 rounded-2xl hover:bg-rose-50 transition-all"
                     >
                        <X size={20} />
                     </button>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL (Copy from Overview) */}
      {withdrawId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border border-slate-200">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
                 <X size={32} />
              </div>
              <h3 className="text-xl font-black text-center text-slate-900 mb-2 uppercase tracking-tight">Withdrawal Hub</h3>
              <p className="text-center text-slate-500 font-medium text-sm leading-relaxed mb-10">This will permanently terminate the clinical verification process and delete all partner quotes.</p>
              
              <div className="flex flex-col gap-3">
                 <button 
                   onClick={() => handleWithdraw(withdrawId)}
                   disabled={processing}
                   className="w-full py-5 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all active:scale-95 shadow-xl shadow-rose-200"
                 >
                    {processing ? 'Processing...' : 'Confirm Termination'}
                 </button>
                 <button 
                   onClick={() => setWithdrawId(null)}
                   disabled={processing}
                   className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest"
                 >
                    Reschedule
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
