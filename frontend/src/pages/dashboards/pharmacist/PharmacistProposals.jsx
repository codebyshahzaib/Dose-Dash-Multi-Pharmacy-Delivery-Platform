import { useState, useEffect } from 'react';
import { apiRequest } from '../../../api/client';
import { 
  History, 
  Search, 
  ExternalLink, 
  Filter,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';

export default function PharmacistProposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const res = await apiRequest('/proposals/pharmacist');
      setProposals(res.proposals || []);
    } catch (err) {
      console.error('Failed to fetch history', err);
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Submission History</h2>
          <p className="text-sm text-slate-500 mt-1">Archive of fulfillment quotes and status responses.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
            <div className="relative flex-1 max-w-md">
               <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                  type="text" 
                  placeholder="Search by Patient or Quote ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400"
               />
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all">
               <Filter size={14} />
               Filter History
            </button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
               <thead>
                  <tr className="bg-slate-50/50">
                     <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reference</th>
                     <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Patient Name</th>
                     <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quote Total</th>
                     <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                     <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {loading ? (
                     Array(3).fill(0).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                           <td colSpan={5} className="px-6 py-6"><div className="h-4 bg-slate-50 rounded w-full"></div></td>
                        </tr>
                     ))
                  ) : filteredProposals.length === 0 ? (
                     <tr>
                        <td colSpan={5} className="p-20 text-center">
                           <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                              <History size={24} />
                           </div>
                           <p className="text-sm font-bold text-slate-500">No matching records.</p>
                        </td>
                     </tr>
                  ) : filteredProposals.map((p) => (
                     <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-900">#QT-{p.id}</span>
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">Quote</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <p className="text-sm font-bold text-slate-800">{p.prescription?.customer?.user?.name || 'Unknown'}</p>
                           <p className="text-[10px] text-slate-400 mt-0.5 italic">Rx Ref: #{p.prescriptionId}</p>
                        </td>
                        <td className="px-6 py-5">
                           <p className="text-sm font-bold text-slate-900 tabular-nums">Rs. {Number(p.totalPrice || 0).toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-5">
                           <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                              p.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              p.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                           }`}>
                              {p.status === 'ACCEPTED' && <CheckCircle2 size={10} />}
                              {p.status === 'REJECTED' && <XCircle size={10} />}
                              {p.status === 'PENDING' && <Clock size={10} />}
                              {p.status}
                           </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                           <button className="h-8 px-3 bg-white border border-slate-200 rounded text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                              <ExternalLink size={14} />
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
