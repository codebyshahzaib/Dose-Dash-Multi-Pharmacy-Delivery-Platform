import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function ProposalListView({ proposals, onSelect }) {
  if (proposals.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-20 text-center max-w-2xl mx-auto shadow-sm">
         <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center mx-auto mb-6 text-slate-300">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
         </div>
         <h3 className="text-lg font-bold text-slate-900 mb-1">Repository Empty</h3>
         <p className="text-slate-500 font-medium text-sm">System awaiting responses from the pharmacological network.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reference</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Commitment</th>
              <th className="px-8 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {proposals.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-md">
                      {p.pharmacist?.user?.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">Quote #{p.id}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm inline-block ${
                     p.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                     p.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                   }`}>
                     {p.status}
                   </span>
                </td>
                <td className="px-8 py-6 text-right">
                   <div className="flex flex-col items-end">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[10px] font-black text-slate-400">Rs.</span>
                        <span className="text-xl font-black text-slate-900 tabular-nums tracking-tighter">
                          {Number(p.totalPrice || 0).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{p.items?.length} Medicines</span>
                   </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => onSelect(p)}
                    className="px-6 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl hover:bg-slate-900 hover:text-white transition-all active:scale-95 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 ml-auto shadow-sm"
                  >
                    Details
                    <ArrowRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
