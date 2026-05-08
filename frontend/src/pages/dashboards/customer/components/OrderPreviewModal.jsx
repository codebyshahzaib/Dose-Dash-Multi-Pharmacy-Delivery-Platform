import React from 'react';
import { ShieldCheck, MapPin, Building2, Package, Check } from 'lucide-react';

export default function OrderPreviewModal({ 
  show, 
  proposal, 
  selectedAlts, 
  selectedStockOverrides, 
  deliveryAddress,
  onConfirm, 
  onCancel,
  utils 
}) {
  if (!show || !proposal) return null;

  const { Number: num } = utils;

  // Group items by pharmacy
  const pharmacyGroups = {};

  proposal.items.forEach(item => {
    const selectedAltId = selectedAlts[item.id] || item.alternatives[0]?.id;
    const selectedAlt = item.alternatives.find(a => a.id === selectedAltId);
    
    const forcedStockId = selectedStockOverrides[item.id];
    const activeStock = forcedStockId 
      ? (selectedAlt?.pharmacyStockId === forcedStockId ? selectedAlt.pharmacyStock : null) 
      : selectedAlt?.pharmacyStock;

    if (!activeStock) return;

    const pharmacyId = activeStock.pharmacy.id;
    if (!pharmacyGroups[pharmacyId]) {
      pharmacyGroups[pharmacyId] = {
        name: activeStock.pharmacy.name,
        address: activeStock.pharmacy.address,
        items: [],
        subtotal: 0
      };
    }

    const price = num(activeStock.price);
    const qty = item.prescriptionItem?.quantity || 1;
    const packSize = num(activeStock.medicine.packSize || 1);
    const itemTotal = (price / packSize) * qty;

    pharmacyGroups[pharmacyId].items.push({
      name: activeStock.medicine.name,
      qty,
      total: itemTotal
    });
    pharmacyGroups[pharmacyId].subtotal += itemTotal;
  });

  const grandTotal = Object.values(pharmacyGroups).reduce((acc, g) => acc + g.subtotal, 0);

  return (
    <div className="fixed inset-0 bg-slate-950/90 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
         {/* Header */}
         <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Final Order Preview</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                 <ShieldCheck size={14} className="text-teal-500" /> Clinical Fulfillment Protocol
              </p>
            </div>
            <div className="text-right">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Amount</span>
               <span className="text-2xl font-black text-slate-900 tabular-nums">Rs. {grandTotal.toFixed(2)}</span>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10">
            {/* Logistics Summary */}
            <div className="bg-indigo-50/30 rounded-3xl p-6 border border-indigo-100/50">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                     <MapPin size={20} />
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Shipping Destination</p>
                     <p className="text-sm font-bold text-slate-900">{deliveryAddress || 'No address specified'}</p>
                  </div>
               </div>
               <p className="text-[10px] font-bold text-indigo-600/60 uppercase tracking-widest leading-relaxed">
                  Multiple pharmacies detected. Your order will be split into individual fulfillment requests for clinical verification.
               </p>
            </div>

            {/* Pharmacy Splits */}
            <div className="space-y-8">
               {Object.values(pharmacyGroups).map((group, gIdx) => (
                  <div key={gIdx} className="space-y-4">
                     <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                           <Building2 size={16} className="text-slate-400" />
                           <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{group.name}</h4>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sub-bill: Rs. {group.subtotal.toFixed(2)}</span>
                     </div>
                     <div className="space-y-3 pl-7">
                        {group.items.map((item, iIdx) => (
                           <div key={iIdx} className="flex justify-between items-center group">
                              <div className="flex items-center gap-3">
                                 <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-indigo-400 transition-colors"></div>
                                 <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{item.name}</span>
                                 <span className="text-[10px] font-black text-slate-300 uppercase">× {item.qty}</span>
                              </div>
                              <span className="text-xs font-bold text-slate-900 tabular-nums">Rs. {item.total.toFixed(2)}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               ))}
            </div>

            {/* Substitution Clause */}
            <div className="pt-8 border-t border-slate-100">
               <div className="bg-emerald-50/30 rounded-2xl p-5 border border-emerald-100/50 flex gap-4">
                  <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm flex-shrink-0">
                     <Check size={18} />
                  </div>
                  <p className="text-[11px] font-bold text-emerald-800 leading-relaxed uppercase tracking-wider">
                     I consent to pharmacological substitution as per the clinical protocol. I understand that the delivery is free and fulfilled by verified partners.
                  </p>
               </div>
            </div>
         </div>

         {/* Actions */}
         <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex flex-col gap-4">
            <button 
               onClick={onConfirm}
               className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95"
            >
               Confirm & Dispatch Orders
            </button>
            <button 
               onClick={onCancel}
               className="w-full py-2 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-all text-center"
            >
               Go back to selections
            </button>
         </div>
      </div>
    </div>
  );
}
