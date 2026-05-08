import React from 'react';
import { X } from 'lucide-react';

export default function PharmacySearchOverlay({ 
  searchState, 
  city, 
  onClose, 
  onSelect 
}) {
  const { itemId, loading, options } = searchState;
  
  if (!itemId) return null;

  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
         <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h4 className="font-black text-slate-900 uppercase tracking-tight">Select Fulfillment Center</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available in {city}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} />
            </button>
         </div>
         <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="py-20 text-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div></div>
            ) : options.length === 0 ? (
              <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">No stock found in your city.</div>
            ) : (
              options.map(opt => (
                <div key={opt.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-indigo-500 transition-all group">
                   <div>
                      <p className="font-bold text-slate-900">{opt.pharmacy.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{opt.pharmacy.address}</p>
                   </div>
                   <button 
                     onClick={() => onSelect(itemId, opt.id)}
                     className="px-4 py-2 bg-slate-50 text-[10px] font-black text-slate-900 uppercase tracking-widest rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                   >
                     Select Rs. {opt.price}
                   </button>
                </div>
              ))
            )}
         </div>
      </div>
    </div>
  );
}
