import React from 'react';
import { ArrowLeft, PackageCheck, Building2, MapPin, X, ShieldCheck } from 'lucide-react';
import FulfillmentItem from './FulfillmentItem';
import PharmacySearchOverlay from './PharmacySearchOverlay';
import OrderPreviewModal from './OrderPreviewModal';

export default function ProposalDetailView({ 
  proposal: p, 
  onBack, 
  onAction,
  optimizeStates,
  selectionHandlers,
  utils 
}) {
  const { 
    optimizing, 
    processing, 
    deliveryAddress, 
    selectedAlts, 
    selectedStockOverrides,
    pharmacySearch,
    showConsent
  } = optimizeStates;

  const {
    optimizeFulfillment,
    findPharmacyStock,
    selectPharmacyForItem,
    setPharmacySearch,
    setShowConsent,
    setDeliveryAddress
  } = selectionHandlers;

  const { parsePackSize, Number: num } = utils;

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-wider transition-all"
      >
        <ArrowLeft size={16} />
        Back to List
      </button>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
        {/* Fulfillment Optimizer Header */}
        <div className="bg-indigo-600 px-8 py-3 flex items-center justify-between">
           <div className="flex items-center gap-2 text-white">
              <PackageCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Fulfillment Optimizer</span>
           </div>
           <button 
             onClick={optimizeFulfillment}
             disabled={optimizing}
             className="text-[10px] font-black bg-white/10 text-white px-4 py-1.5 rounded-lg hover:bg-white/20 transition-all flex items-center gap-2 uppercase tracking-widest disabled:opacity-50"
           >
              {optimizing ? 'Analyzing...' : 'Find pharmacy with everything'}
           </button>
        </div>

        {/* Identity Header */}
        <div className="p-8 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">
              {p.pharmacist?.user?.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Dr. {p.pharmacist?.user?.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                 <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></div>
                 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Clinical Specialist Assigned</p>
              </div>
            </div>
          </div>
          <div className="bg-white px-6 py-4 rounded-lg border border-slate-200 shadow-inner flex flex-col items-center md:items-end">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Total Commitment</span>
             <span className="text-2xl font-bold text-teal-600 tabular-nums">Rs. {Number(p.totalPrice || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Overlays */}
        <PharmacySearchOverlay 
          searchState={pharmacySearch}
          city={p.prescription?.customer?.city}
          onClose={() => setPharmacySearch({ itemId: null, medicineId: null, options: [] })}
          onSelect={selectPharmacyForItem}
        />

        <OrderPreviewModal 
          show={showConsent}
          proposal={p}
          selectedAlts={selectedAlts}
          selectedStockOverrides={selectedStockOverrides}
          deliveryAddress={deliveryAddress}
          utils={utils}
          onConfirm={() => { setShowConsent(false); onAction(p.id, 'ACCEPTED'); }}
          onCancel={() => setShowConsent(false)}
        />

        <div className="max-w-4xl mx-auto p-8 space-y-12">
           <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fulfillment Protocol Items</h4>
                 <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{p.items?.length} Prescriptions Matched</span>
              </div>
              
              {p.items?.map((item, idx) => {
                const selectedAltId = selectedAlts[item.id] || item.alternatives[0]?.id;
                const selectedAlt = item.alternatives.find(a => a.id === selectedAltId);
                
                const forcedStockId = selectedStockOverrides[item.id];
                const activeStock = forcedStockId 
                  ? pharmacySearch.options.find(o => o.id === forcedStockId) 
                    || (selectedAlt?.pharmacyStockId === forcedStockId ? selectedAlt.pharmacyStock : null)
                  : selectedAlt?.pharmacyStock;

                return (
                  <FulfillmentItem 
                    key={item.id}
                    item={item}
                    idx={idx}
                    selectedAlt={selectedAlt}
                    activeStock={activeStock}
                    onFindPharmacy={findPharmacyStock}
                    onRevert={findPharmacyStock} // In this context, findPharmacyStock(item.id, prescribedMedId) reverts to brand
                    utils={utils}
                  />
                );
              })}
           </div>

           {/* Checkout Footer */}
           <div className="pt-12 border-t border-slate-100 flex flex-col items-center max-w-xl mx-auto w-full gap-8">
              <div className="w-full space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block text-center">Final Delivery Destination</label>
                 <input 
                   type="text" 
                   placeholder="Enter precise shipping address..."
                   value={deliveryAddress}
                   onChange={(e) => setDeliveryAddress(e.target.value)}
                   className="w-full rounded-2xl border border-slate-200 px-6 py-5 bg-white focus:border-indigo-600 outline-none transition-all font-black text-slate-900 text-sm shadow-sm placeholder:text-slate-200 text-center"
                 />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full">
                 <button 
                    onClick={() => setShowConsent(true)}
                    disabled={processing || !deliveryAddress}
                    className="flex-1 bg-slate-900 text-white font-black py-5 rounded-2xl tracking-[0.2em] uppercase text-[10px] hover:bg-indigo-600 transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                 >
                    <PackageCheck size={18} />
                    Place Orders Now
                 </button>
                 <button 
                    onClick={() => onAction(p.id, 'REJECTED')}
                    disabled={processing}
                    className="px-8 bg-white text-rose-500 font-black py-5 rounded-2xl tracking-[0.2em] uppercase text-[10px] border border-slate-100 hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                 >
                    Decline Quote
                 </button>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                 <ShieldCheck size={16} />
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">Secured Pharmacological Settlement</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
