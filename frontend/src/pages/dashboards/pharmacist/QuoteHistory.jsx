import { useState, useEffect } from 'react';
import { apiRequest } from '../../../api/client';
import { 
  History, 
  Search, 
  ExternalLink, 
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  Filter,
  ArrowRight
} from 'lucide-react';

export default function QuoteHistory() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const res = await apiRequest('/proposals/pharmacist');
      // Only show ACCEPTED and REJECTED proposals in History
      const history = (res.proposals || []).filter(p => p.status === 'ACCEPTED' || p.status === 'REJECTED');
      setProposals(history);
    } catch (err) {
      console.error('Failed to fetch quote history', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProposals = proposals.filter(p => 
    p.prescription?.customer?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toString() === searchTerm
  );

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Decision Archive</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Complete record of approved and declined clinical proposals.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-2">
                <History size={14} className="text-slate-500" />
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{proposals.length} Records</span>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
            <div className="relative flex-1 max-w-md">
               <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                  type="text" 
                  placeholder="Search archive by patient or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-slate-800 outline-none transition-all placeholder:text-slate-400"
               />
            </div>
         </div>

         <div className="w-full relative">
           <div className="overflow-auto scrollbar-thin scrollbar-thumb-slate-200 block border border-slate-200 rounded-2xl shadow-sm bg-white max-h-[600px]">
            <table className="w-full border-collapse min-w-[1100px] table-auto">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                     <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">Archived Ref</th>
                     <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">Patient Context</th>
                     <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">Final Value</th>
                     <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">Outcome</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {loading ? (
                     Array(3).fill(0).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                           <td colSpan={4} className="px-6 py-8"><div className="h-6 bg-slate-100 rounded-lg w-full"></div></td>
                        </tr>
                     ))
                  ) : filteredProposals.length === 0 ? (
                     <tr>
                        <td colSpan={4} className="p-24 text-center">
                           <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-200 border border-slate-100">
                              <History size={32} />
                           </div>
                           <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Archive Empty</h3>
                           <p className="text-xs font-medium text-slate-400 mt-2">No quotes have reached a final decision yet.</p>
                        </td>
                     </tr>
                  ) : filteredProposals.map((p) => (
                     <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-6 whitespace-nowrap">
                           <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-900 tracking-tight">#QT-{p.id}</span>
                              <span className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter tabular-nums flex items-center gap-1.5">
                                <Calendar size={10} />
                                {new Date(p.createdAt).toLocaleDateString()}
                              </span>
                           </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors shrink-0">
                                 <User size={18} />
                              </div>
                              <div className="min-w-0">
                                 <p className="text-sm font-black text-slate-800 truncate tracking-tight uppercase leading-tight">{p.prescription?.customer?.user?.name || 'Anonymous'}</p>
                                 <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{p.prescription?.customer?.city || 'Unk City'} • Rx Ref: #{p.prescriptionId}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                           <p className="text-sm font-black text-slate-900 tabular-nums tracking-tight">Rs. {Number(p.totalPrice || 0).toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                           <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-[0.1em] ${
                              p.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm shadow-emerald-700/5' : 
                              'bg-rose-50 text-rose-700 border-rose-100 shadow-sm shadow-rose-700/5'
                           }`}>
                              {p.status === 'ACCEPTED' ? <CheckCircle2 size={12} strokeWidth={2.5} /> : <XCircle size={12} strokeWidth={2.5} />}
                              <span>{p.status}</span>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
