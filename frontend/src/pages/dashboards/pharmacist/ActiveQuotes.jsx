import { useState, useEffect } from 'react';
import { apiRequest } from '../../../api/client';
import { 
  Activity, 
  Search, 
  ExternalLink, 
  Filter,
  Clock,
  User,
  TrendingDown,
  ArrowRight,
  Building2,
  Eye,
  X,
  FileText,
  ShieldCheck,
  ClipboardCheck,
  CheckCircle2,
  MapPin
} from 'lucide-react';

function QuoteDetailModal({ quote, onClose }) {
  if (!quote) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
       <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[1.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scale-in">
          {/* MINIMAL HEADER */}
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-md">
                   <FileText size={18} />
                </div>
                <div>
                   <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Quote Details</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Reference #{quote.id} • {quote.prescription?.customer?.user?.name}</p>
                </div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                <X size={20} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
             {/* KEY METRICS GRID - SIMPLIFIED */}
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient Location</p>
                   <p className="text-sm font-black text-slate-800 uppercase">{quote.prescription?.customer?.city || 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Items Included</p>
                   <p className="text-sm font-black text-slate-800 uppercase">{quote.items?.length || 0} Products Found</p>
                </div>
             </div>

             {/* SIMPLIFIED TABLE */}
             <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                   <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                         <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Prescribed</th>
                         <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Offered Solution</th>
                         <th className="px-6 py-3 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {quote.items?.map((item) => {
                         const selectedAlt = item.alternatives?.[0];
                         return (
                            <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                               <td className="px-6 py-4 whitespace-nowrap">
                                  <p className="text-xs font-black text-slate-800 uppercase">{item.prescriptionItem?.rawName}</p>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">MRP: Rs. {Number(item.prescriptionItem?.originalPrice || 0).toLocaleString()}</p>
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap">
                                  <p className="text-xs font-black text-indigo-600 uppercase leading-none">{selectedAlt?.pharmacyStock?.medicine?.name}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">
                                     {selectedAlt?.pharmacyStock?.pharmacy?.name} • {selectedAlt?.pharmacyStock?.medicine?.salt}
                                  </p>
                               </td>
                               <td className="px-6 py-4 text-right whitespace-nowrap">
                                  <p className="text-xs font-black text-slate-900 tabular-nums tracking-tight">Rs. {Number(selectedAlt?.offeredPrice || 0).toLocaleString()}</p>
                                  <p className="text-[8px] font-black text-emerald-500 uppercase mt-0.5">Qty: {selectedAlt?.quantity}</p>
                               </td>
                            </tr>
                         );
                      })}
                   </tbody>
                </table>
             </div>
          </div>
       </div>
    </div>
  );
}

export default function ActiveQuotes() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState(null);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const res = await apiRequest('/proposals/pharmacist');
      // Only show PENDING proposals in Active Quotes
      const pending = (res.proposals || []).filter(p => p.status === 'PENDING');
      setProposals(pending);
    } catch (err) {
      console.error('Failed to fetch active quotes', err);
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
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Active Proposals</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Tracking {proposals.length} fulfillments waiting for customer approval.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Live Desk</span>
            </div>
        </div>
      </div>

      {selectedQuote && <QuoteDetailModal quote={selectedQuote} onClose={() => setSelectedQuote(null)} />}

      {/* STATS STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-full">
         <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <User size={64} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Patient Reach</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
               {new Set(proposals.map(p => p.prescription?.customerId)).size} Patients
            </p>
         </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
         <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
            <div className="relative flex-1 max-w-md">
               <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                  type="text" 
                  placeholder="Filter active quotes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-slate-800 outline-none transition-all placeholder:text-slate-400"
               />
            </div>
         </div>
      </div>

      <div className="w-full relative">
         <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 block border border-slate-200 rounded-2xl shadow-sm bg-white overflow-hidden">
            <table className="w-full border-collapse min-w-[1100px] table-auto">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                     <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">Reference</th>
                     <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">Patient Details</th>
                     <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">Status</th>
                     <th className="px-6 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap w-24">Actions</th>
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
                              <Activity size={32} />
                           </div>
                           <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">No Active Proposals</h3>
                           <p className="text-xs font-medium text-slate-400 mt-2">All sent quotes have been processed or none have been sent.</p>
                        </td>
                     </tr>
                  ) : filteredProposals.map((p) => (
                     <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-6 whitespace-nowrap">
                           <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">#QT-{p.id}</span>
                              <span className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter tabular-nums">
                                {new Date(p.createdAt).toLocaleDateString()} at {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                           </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                                 <User size={18} />
                              </div>
                              <div className="min-w-0">
                                 <p className="text-sm font-black text-slate-800 truncate tracking-tight uppercase leading-tight">{p.prescription?.customer?.user?.name || 'Anonymous Patient'}</p>
                                 <p className="text-[10px] font-bold text-indigo-500 mt-1 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                       <div className="w-0.5 h-0.5 rounded-full bg-indigo-500"></div>
                                    </span>
                                    {p.prescription?.customer?.city || 'Unk City'}
                                 </p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 shadow-sm text-[10px] font-black uppercase tracking-[0.1em]">
                              <Clock size={12} strokeWidth={2.5} className="animate-pulse" />
                              <span>{p.status}</span>
                           </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-right">
                           <button 
                              onClick={() => setSelectedQuote(p)}
                              className="h-10 w-10 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all shadow-sm flex items-center justify-center ml-auto group/edit"
                           >
                              <Eye size={16} className="group-hover/edit:scale-110 transition-transform" />
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
