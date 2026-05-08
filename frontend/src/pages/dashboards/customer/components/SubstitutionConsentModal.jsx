import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function SubstitutionConsentModal({ show, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 z-[100] flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-10 text-center shadow-2xl">
         <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShieldCheck size={40} />
         </div>
         <h3 className="text-xl font-bold text-slate-900 mb-4">Substitution Consent</h3>
         <p className="text-slate-500 text-sm leading-relaxed mb-10">
           By accepting this quote, you acknowledge and agree to switch from the doctor-prescribed brand to the pharmacological alternatives suggested by our verification team. Is this correct?
         </p>
         <div className="space-y-3">
            <button 
               onClick={onConfirm}
               className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-indigo-700 transition-all"
            >
               Yes, I Consent to Switch
            </button>
            <button 
               onClick={onCancel}
               className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[11px] hover:text-slate-600 transition-all"
            >
               Cancel
            </button>
         </div>
      </div>
    </div>
  );
}
