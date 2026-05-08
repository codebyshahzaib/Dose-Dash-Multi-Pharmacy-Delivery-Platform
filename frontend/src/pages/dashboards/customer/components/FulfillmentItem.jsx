import React from 'react';
import { Building2, MapPin, X } from 'lucide-react';

export default function FulfillmentItem({ 
  item, 
  idx, 
  selectedAlt, 
  activeStock, 
  onFindPharmacy, 
  onRevert,
  utils 
}) {
  const { Number: num } = utils;

  // Price Calculations
  const prescribedPrice = num(item.originalPrice || 0);
  const prescribedQty = item.prescriptionItem?.quantity || 1;
  const prescribedPackSize = num(item.prescriptionItem?.rawPackSize || 1);
  const prescribedUnit = prescribedPrice / prescribedPackSize;
  const prescribedTotal = prescribedUnit * prescribedQty;

  const suggestedPackPrice = num(activeStock?.price || selectedAlt?.offeredPrice || 0);
  const suggestedPackSizeCount = num(activeStock?.medicine?.packSize || selectedAlt?.pharmacyStock.medicine.packSize || 1);
  const suggestedUnit = suggestedPackPrice / suggestedPackSizeCount;
  const suggestedTotal = suggestedUnit * prescribedQty;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
         <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black tracking-widest">{idx + 1}</span>
            <div>
               <h4 className="text-sm font-black text-slate-900 leading-none">{item.prescriptionItem?.rawName}</h4>
               <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Prescribed Quantity: {prescribedQty} Units</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
         {/* LEFT: DOCTOR PRESCRIBED */}
         <div className="p-8 border-r border-slate-100">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-6 underline decoration-slate-200 underline-offset-4">Doctor's Original Order</span>
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-y-4 text-[10px] font-bold uppercase tracking-wider">
                  <div className="text-slate-400">Pack Size</div>
                  <div className="text-right text-slate-600">{prescribedPackSize} Units</div>
                  
                  <div className="text-slate-400">Pack Price</div>
                  <div className="text-right text-slate-600">Rs. {prescribedPrice.toFixed(2)}</div>

                  <div className="text-slate-400">Fulfillment Qty</div>
                  <div className="text-right text-indigo-600 underline underline-offset-4 decoration-indigo-200">{prescribedQty} Units</div>
                  
                  <div className="text-slate-400">Unit Price</div>
                  <div className="text-right text-slate-600">Rs. {prescribedUnit.toFixed(2)}</div>
               </div>
               <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Settlement</span>
                  <div className="text-right">
                     <p className="text-xl font-black text-slate-400 tabular-nums">Rs. {prescribedTotal.toFixed(2)}</p>
                  </div>
               </div>
            </div>
         </div>

         {/* RIGHT: SYSTEM SUGGESTION */}
         <div className={`p-8 transition-all ${selectedAlt ? 'bg-indigo-50/10' : 'bg-slate-50'}`}>
            <div className="flex justify-between items-start mb-6">
               <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block underline decoration-indigo-200 underline-offset-4">Fulfillment Selection</span>
               {selectedAlt && (
                 <button 
                   onClick={() => onFindPharmacy(item.id, selectedAlt.pharmacyStock.medicineId)}
                   className="text-[9px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest flex items-center gap-1.5"
                 >
                    <Building2 size={12} /> Change Pharmacy
                 </button>
               )}
            </div>

            {selectedAlt ? (
               <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-y-4 text-[10px] font-black uppercase tracking-wider">
                     <div className="text-indigo-400">Pack Size</div>
                     <div className="text-right text-slate-900">{suggestedPackSizeCount} Units</div>
                     
                     <div className="text-indigo-400">Pack Price</div>
                     <div className="text-right text-slate-900">Rs. {suggestedPackPrice.toFixed(2)}</div>

                     <div className="text-indigo-400">Fulfillment Qty</div>
                     <div className="text-right text-indigo-600 underline underline-offset-4 decoration-indigo-200">{prescribedQty} Units</div>
                     
                     <div className="text-indigo-400">Unit Price</div>
                     <div className="text-right text-indigo-600">Rs. {suggestedUnit.toFixed(2)}</div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                     <p className="text-[10px] font-bold text-indigo-500 flex items-center gap-1.5">
                        <MapPin size={12} /> {activeStock?.pharmacy?.name || selectedAlt.pharmacyStock.pharmacy.name}
                     </p>
                     <button 
                       onClick={() => onRevert(item.id, item.prescriptionItem.medicineId)}
                       className="text-[9px] font-black text-slate-300 hover:text-rose-500 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                     >
                        <X size={10} /> Revert to Doctor Brand
                     </button>
                  </div>

                  <div className="pt-6 border-t border-indigo-100 flex justify-between items-end">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">Total Item Savings</span>
                        <span className="text-[10px] font-bold text-emerald-600">Rs. {(prescribedTotal - suggestedTotal).toFixed(2)}</span>
                     </div>
                     <div className="text-right">
                        <p className="text-2xl font-black text-slate-900 tabular-nums leading-none">Rs. {suggestedTotal.toFixed(2)}</p>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-center py-6">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Fulfillment Missing</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
