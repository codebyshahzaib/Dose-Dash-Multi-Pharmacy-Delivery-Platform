import { useState, useEffect, useRef } from 'react';
import { apiRequest, secureFileUrl } from '../api/client';
import { 
  X, 
  Plus, 
  Trash2, 
  Search, 
  Send, 
  Pill, 
  FileText, 
  ExternalLink, 
  ChevronRight,
  User,
  Activity,
  Maximize2,
  AlertCircle,
  Hash,
  ShoppingBag,
  Info,
  ChevronDown,
  ChevronUp,
  Globe,
  MapPin,
  Building2,
  PackageCheck,
  ClipboardList,
  History,
  ArrowRight
} from 'lucide-react';

export default function PharmacistEntryModal({ prescription, onClose, onSubmit }) {
  // --- Step Tracking ---
  const [step, setStep] = useState(1); // 1: Transcription, 2: Proposal

  // --- Step 1: Transcription State ---
  const [transcribedItems, setTranscribedItems] = useState(
    prescription.items?.length > 0 
    ? prescription.items.map(i => ({ 
        ...i, 
        rawName: i.rawName || '',
        rawSalt: i.rawSalt || '',
        rawStrength: i.rawStrength || '',
        rawForm: i.rawForm || '',
        rawPackSize: i.rawPackSize || '',
        remarks: i.remarks || '',
        medicineName: i.medicine?.name || '' 
      }))
    : [{ id: Date.now(), medicineId: null, rawName: '', rawSalt: '', rawStrength: '', rawForm: '', rawPackSize: '', quantity: 1, originalPrice: '', remarks: '' }]
  );
  const [isTranscribing, setIsTranscribing] = useState(false);

  // --- Global Lookup State ---
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionLine, setActiveSuggestionLine] = useState(null); // id of line being searched
  const searchTimeout = useRef(null);

  // --- Step 2: Proposal State ---
  const [proposalItems, setProposalItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [isViewerCollapsed, setIsViewerCollapsed] = useState(false);

  // --- Utilities ---
  const parsePackSize = (str) => {
    if (!str) return 1;
    if (typeof str === 'number') return str;
    const match = str.toString().match(/(\d+)/);
    return match ? parseInt(match[0]) : 1;
  };

  const getSavings = (originalUnit, currentUnit) => {
    if (!originalUnit || !currentUnit) return 0;
    const diff = originalUnit - currentUnit;
    return Math.round((diff / originalUnit) * 100);
  };

  // Alternative Discovery State
  const [altSearch, setAltSearch] = useState({ 
    itemId: null, 
    salt: '', 
    inventory: [], 
    inventoryLoading: false 
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const bottomRef = useRef(null);

  // --- Step 1 Actions ---
  const fetchSuggestions = (query, id) => {
    setActiveSuggestionLine(id);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await apiRequest(`/proposals/search-medicines?q=${query}`);
        setSuggestions(res.medicines || []);
      } catch (err) {
        console.error('Lookup failed', err);
      }
    }, 300);
  };

  const handleMedicineSelect = (lineId, medicine) => {
    setTranscribedItems(prev => prev.map(item => {
      if (item.id === lineId) {
        return {
          ...item,
          medicineId: medicine.id,
          rawName: medicine.name,
          rawSalt: medicine.salt || '',
          rawStrength: medicine.strength || '',
          rawForm: medicine.form || '',
          rawPackSize: medicine.packSize || '',
          originalPrice: medicine.mrp || '',
          remarks: item.remarks || '' // keep existing remarks
        };
      }
      return item;
    }));
    setSuggestions([]);
    setActiveSuggestionLine(null);
  };

  const handleTranscriptionChange = (id, field, value) => {
    setTranscribedItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    
    // Trigger lookup if name changes
    if (field === 'rawName') {
      fetchSuggestions(value, id);
    }
  };

  const addTranscriptionLine = () => {
    setTranscribedItems([...transcribedItems, { id: Date.now(), medicineId: null, rawName: '', rawSalt: '', rawStrength: '', rawForm: '', quantity: 1, remarks: '' }]);
  };

  const removeTranscriptionLine = (id) => {
    if (transcribedItems.length > 1) setTranscribedItems(transcribedItems.filter(item => item.id !== id));
  };

  const saveTranscription = async () => {
    setIsTranscribing(true);
    try {
      await apiRequest(`/proposals/prescriptions/${prescription.id}/items`, {
        method: 'POST',
        body: JSON.stringify({ items: transcribedItems })
      });
      
      // Fetch the items back (now with IDs from server)
      const res = await apiRequest(`/proposals/pharmacist/prescriptions`);
      const updatedRx = res.prescriptions.find(p => p.id === prescription.id);
      
      if (updatedRx && updatedRx.items) {
        // IMPORTANT: Update transcribedItems with server-side IDs 
        // to keep the calculations linked in Step 2 (Doc total lookup)
        setTranscribedItems(updatedRx.items.map(item => ({
          id: item.id, // Databases ID
          medicineId: item.medicineId,
          rawName: item.rawName,
          rawSalt: item.rawSalt,
          rawStrength: item.rawStrength,
          rawForm: item.rawForm,
          rawPackSize: item.rawPackSize,
          quantity: item.quantity,
          originalPrice: item.originalPrice || 0,
          remarks: item.remarks || ''
        })));

        setProposalItems(updatedRx.items.map(item => ({
          prescriptionItemId: item.id,
          medicineId: item.medicineId,
          rawName: item.rawName,
          rawSalt: item.rawSalt,
          rawStrength: item.rawStrength,
          rawPackSize: item.rawPackSize,
          originalPrice: item.originalPrice || 0,
          alternatives: []
        })));
      }
      
      setStep(2);
    } catch (err) {
      alert('Transcription failed: ' + err.message);
    } finally {
      setIsTranscribing(false);
    }
  };

  // --- Step 2 Actions ---
  const findAlternatives = async (itemId, salt) => {
    const itemInfo = transcribedItems.find(t => t.id === itemId);
    setAltSearch({ 
      itemId, 
      salt, 
      inventory: [], 
      medicines: [], // New state for global medicines
      inventoryLoading: true,
      reference: itemInfo 
    });
    try {
      const res = await apiRequest(`/proposals/alternatives-by-salt?salt=${salt}&prescriptionId=${prescription.id}`);
      setAltSearch(prev => ({ 
        ...prev, 
        inventory: res.inventory || [], 
        medicines: res.medicines || [],
        inventoryLoading: false 
      }));
    } catch (err) {
      setAltSearch(prev => ({ ...prev, inventoryLoading: false }));
    }
  };

  const selectMedication = (itemId, target, isAlternative = true) => {
    const itemInfo = transcribedItems.find(t => t.id === itemId);
    const initialQty = Number(itemInfo?.quantity) || 1;
    
    // Find matching stock record for fulfillment
    const stockRecord = isAlternative ? altSearch.inventory.find(inv => inv.medicineId === target.id) : null;

    setProposalItems(prev => prev.map(item => {
      if (item.prescriptionItemId !== itemId) return item;
      
      if (!isAlternative) {
         return { ...item, alternatives: [] };
      }

      return {
        ...item,
        alternatives: [
          {
            pharmacyStockId: stockRecord?.id || 0, 
            medicineId: target.id,
            medicineName: target.name,
            packSize: target.packSize,
            packPrice: stockRecord?.price || target.mrp || 0,
            quantity: initialQty
          }
        ]
      };
    }));
    setAltSearch({ itemId: null, salt: '', inventory: [], medicines: [], inventoryLoading: false });
  };

  const removeAlternative = (itemId, stockId) => {
    setProposalItems(prev => prev.map(item => {
      if (item.prescriptionItemId !== itemId) return item;
      return { ...item, alternatives: item.alternatives.filter(a => a.pharmacyStockId !== stockId) };
    }));
  };

  const calculateSavings = () => {
    return proposalItems.reduce((acc, item) => {
      const prescribed = transcribedItems.find(t => t.id === item.prescriptionItemId);
      if (!prescribed || item.alternatives.length === 0) return acc;
      
      const alt = item.alternatives[0];
      const prescribedUnit = parseFloat(prescribed.originalPrice) / parsePackSize(prescribed.rawPackSize);
      const altUnit = parseFloat(alt.packPrice) / parsePackSize(alt.packSize);
      
      const savings = (prescribedUnit - altUnit) * (Number(alt.quantity) || 0);
      return acc + Math.max(0, savings);
    }, 0);
  };

  const handleProposalSubmit = (e) => {
    e?.preventDefault();
    if (proposalItems.some(item => item.alternatives.length === 0)) {
      setShowConfirmModal(true);
    } else {
      performActualSubmit();
    }
  };

  const performActualSubmit = () => {
    onSubmit({
      prescriptionId: prescription.id,
      notes,
      items: proposalItems.map(item => ({
        prescriptionItemId: item.prescriptionItemId,
        medicineId: item.medicineId,
        originalPrice: item.originalPrice || 0,
        alternatives: item.alternatives.map(a => {
          const unitCount = parsePackSize(a.packSize);
          const unitPrice = parseFloat(a.packPrice) / unitCount;
          return {
            pharmacyStockId: a.pharmacyStockId,
            offeredPrice: unitPrice * a.quantity,
            quantity: a.quantity
          };
        })
      }))
    });
  };

  const imageUrl = secureFileUrl(prescription.fileUrl);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-900 font-sans animate-fade-in overflow-hidden">
      {/* ── HEADER ── */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">
              <Pill size={16} />
            </div>
            <h1 className="text-sm font-black uppercase tracking-widest text-slate-800">
              {step === 1 ? 'Step 1: Transcription' : 'Step 2: Recommendations'}
            </h1>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
            <span className="truncate">Patient: <span className="text-slate-900">{prescription.customer?.user?.name || 'Anonymous Patient'}</span></span>
            <span className="flex items-center gap-1"><MapPin size={12} className="text-indigo-500"/> <span className="text-slate-900">{prescription.customer?.city || 'Unk City'}</span></span>
            <span className="flex items-center gap-1"><User size={12} className="text-emerald-500"/> <span className="text-slate-900">{prescription.customer?.user?.phone || 'No Phone'}</span></span>
            <span>Ref: <span className="text-slate-900">#RX-{prescription.id}</span></span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
            <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-all">
            <X size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* VIEWPORT (Prescription Image) */}
        <section className={`transition-all duration-500 bg-slate-900 relative flex flex-col ${isViewerCollapsed ? 'w-12' : 'lg:w-[45%] h-[30vh] lg:h-full'}`}>
          <div className="h-10 bg-black/30 backdrop-blur-md flex items-center justify-between px-4 border-b border-white/5 z-20">
            {!isViewerCollapsed && <span className="text-[10px] font-black text-white uppercase tracking-widest">Digital Prescription</span>}
            <button onClick={() => setIsViewerCollapsed(!isViewerCollapsed)} className="p-1 px-2 text-white/50 hover:text-white">
              <ChevronRight className={isViewerCollapsed ? '' : 'rotate-180'} size={18} />
            </button>
          </div>
          {!isViewerCollapsed && (
            <div className="flex-1 overflow-auto p-4 flex items-start justify-center bg-[#0a0f1d] pattern-grid">
               <img src={imageUrl} alt="RX" className="max-w-full rounded-lg shadow-2xl border border-white/10" />
            </div>
          )}
        </section>

        {/* WORKSPACE (Forms) */}
        <section className="flex-1 flex flex-col bg-slate-50 lg:border-l border-slate-200 overflow-hidden">
          {step === 1 ? (
            /* STEP 1: TRANSCRIPTION WORKSPACE */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Transcription Desk</h2>
                  <p className="text-xs text-slate-500 font-medium">Identify each clinical line item from the prescription image.</p>
                </div>
                <button onClick={addTranscriptionLine} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-100 transition-all">
                  <Plus size={14} /> Add Line
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {transcribedItems.map((item, idx) => (
                  <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-1 flex items-center justify-center font-black text-slate-200 text-xl">{idx+1}</div>
                      <div className="col-span-11 space-y-4">
                        <div className="grid grid-cols-2 gap-4 relative">
                          <div className="col-span-2 md:col-span-1 relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Prescribed Name (Brand)</label>
                            <div className="relative">
                               <input 
                                placeholder="e.g. Panadol" 
                                value={item.rawName || ''} 
                                onChange={e => handleTranscriptionChange(item.id, 'rawName', e.target.value)}
                                onFocus={() => item.rawName && fetchSuggestions(item.rawName, item.id)}
                                className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-indigo-600 transition-all outline-none"
                              />
                              {/* Global Suggestions Dropdown */}
                              {activeSuggestionLine === item.id && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-[70] mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-64 overflow-y-auto no-scrollbar">
                                   <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Clinical matches</span>
                                      <button onClick={() => { setSuggestions([]); setActiveSuggestionLine(null); }} className="p-1 hover:text-rose-500"><X size={12}/></button>
                                   </div>
                                   {suggestions.map((m) => (
                                     <button 
                                       key={m.id}
                                       onClick={() => handleMedicineSelect(item.id, m)}
                                       className="w-full text-left p-4 hover:bg-slate-50 border-b border-slate-50 last:border-none flex items-center justify-between group"
                                     >
                                        <div>
                                           <div className="flex items-center gap-2 mb-1">
                                              <span className="text-sm font-bold text-slate-900">{m.name}</span>
                                              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{m.strength}</span>
                                           </div>
                                           <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                              <span className="text-indigo-600/60">{m.salt}</span>
                                              <span>•</span>
                                              <span>{m.manufacturer}</span>
                                           </div>
                                        </div>
                                        <ArrowRight size={14} className="text-slate-200 group-hover:text-indigo-600 transition-colors" />
                                     </button>
                                   ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="col-span-2 md:col-span-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Active Salt (Generic)</label>
                            <input 
                              placeholder="e.g. Paracetamol" 
                              value={item.rawSalt || ''} 
                              onChange={e => handleTranscriptionChange(item.id, 'rawSalt', e.target.value)}
                              className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-indigo-600 transition-all outline-none"
                            />
                          </div>

                          <div className="col-span-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Form / Strength</label>
                            <div className="flex gap-2">
                                <input 
                                    placeholder="Tablet" 
                                    value={item.rawForm || ''} 
                                    onChange={e => handleTranscriptionChange(item.id, 'rawForm', e.target.value)}
                                    className="w-1/2 bg-slate-50 border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                                />
                                <input 
                                    placeholder="500mg" 
                                    value={item.rawStrength || ''} 
                                    onChange={e => handleTranscriptionChange(item.id, 'rawStrength', e.target.value)}
                                    className="w-1/2 bg-slate-50 border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                                />
                            </div>
                          </div>
                          <div className="col-span-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Quantity</label>
                              <input 
                                type="number"
                                value={item.quantity} 
                                onChange={e => handleTranscriptionChange(item.id, 'quantity', e.target.value)}
                                className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none"
                              />
                           </div>
                           <div className="col-span-1">
                              <label className="text-[10px] font-black text-indigo-400 uppercase mb-1 block">Ref Pack Size</label>
                              <input 
                                placeholder="e.g. 20"
                                value={item.rawPackSize || ''} 
                                onChange={e => handleTranscriptionChange(item.id, 'rawPackSize', e.target.value)}
                                className="w-full bg-indigo-50/50 border-indigo-100 rounded-xl px-4 py-2 text-sm font-bold outline-none text-indigo-700 placeholder:text-indigo-200"
                              />
                           </div>
                           <div className="col-span-1">
                              <label className="text-[10px] font-black text-indigo-400 uppercase mb-1 block">MRP (Pack Price)</label>
                              <input 
                                type="number"
                                placeholder="Rs."
                                value={item.originalPrice || ''} 
                                onChange={e => handleTranscriptionChange(item.id, 'originalPrice', e.target.value)}
                                className="w-full bg-indigo-50/50 border-indigo-100 rounded-xl px-4 py-2 text-sm font-bold outline-none text-indigo-700"
                              />
                           </div>
                           <div className="col-span-1 flex flex-col justify-end pb-1">
                              {item.quantity && item.originalPrice && item.rawPackSize ? (
                                <div className="text-right">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Line Value</span>
                                  <span className="text-xs font-black text-indigo-600">
                                    Rs. {((Number(item.quantity) * parseFloat(item.originalPrice)) / parsePackSize(item.rawPackSize)).toFixed(2)}
                                  </span>
                                </div>
                              ) : (
                                <div className="text-right opacity-20">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Calculate...</span>
                                  <span className="text-xs font-black text-slate-400">Rs. 0.00</span>
                                </div>
                              )}
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <input 
                            placeholder="Additional remarks (e.g. take after meals)" 
                            value={item.remarks || ''} 
                            onChange={e => handleTranscriptionChange(item.id, 'remarks', e.target.value)}
                            className="flex-1 bg-slate-50 border-slate-100 rounded-lg px-3 py-2 text-xs font-semibold outline-none"
                          />
                          {transcribedItems.length > 1 && (
                            <button onClick={() => removeTranscriptionLine(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-2 text-xs font-bold flex items-center gap-1">
                              <Trash2 size={14} /> Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-white border-t border-slate-200 flex justify-end">
                <button 
                  onClick={saveTranscription}
                  disabled={isTranscribing || transcribedItems.some(i => !i.rawName)}
                  className="px-10 py-4 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 disabled:opacity-50 transition-all"
                >
                  {isTranscribing ? 'Saving...' : 'Next: Search Alternatives'}
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: PROPOSAL WORKSPACE */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PackageCheck size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Fulfillment Protocol</span>
                </div>
                <button onClick={() => setStep(1)} className="text-[10px] font-black bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20">Back to Step 1</button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {proposalItems.map((pItem) => {
                  const itemInfo = transcribedItems.find(t => t.id === pItem.prescriptionItemId || t.rawName === pItem.rawName);
                  return (
                    <div key={pItem.prescriptionItemId} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <div>
                          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block mb-1">Prescribed Item</span>
                          <h4 className="text-sm font-black text-slate-800">{itemInfo?.rawName} {itemInfo?.rawStrength}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{itemInfo?.rawSalt || 'No Salt Identified'}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{itemInfo?.rawForm}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => findAlternatives(pItem.prescriptionItemId, itemInfo?.rawSalt)}
                          disabled={!itemInfo?.rawSalt}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
                        >
                          <Search size={12} /> Suggest Salt Match
                        </button>
                      </div>

                      {/* Alternatives List */}
                      <div className="p-5 space-y-3">
                        {pItem.alternatives.length === 0 ? (
                          <div className="py-4 px-6 border border-indigo-100 bg-indigo-50/30 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                                  <ClipboardList size={14} />
                               </div>
                               <div>
                                  <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Using Doctor's Choice</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase">Original prescription will be fulfilled.</p>
                               </div>
                            </div>
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-indigo-100">Standard MRP</span>
                          </div>
                        ) : (
                          pItem.alternatives.map(alt => (
                            <div key={alt.medicineId} className="flex items-center gap-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                               <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-black text-slate-900">{alt.medicineName}</p>
                                    <span className="text-[9px] font-bold bg-slate-200 px-1.5 rounded uppercase">{alt.packSize}</span>
                                  </div>
                                  <div className="mt-1 flex items-center gap-2">
                                     <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Selected Alternative</span>
                                     <span className="w-1 h-1 bg-emerald-200 rounded-full"></span>
                                     <span className="text-[10px] font-bold text-slate-400 uppercase">Saving Rs. {((parseFloat(itemInfo.originalPrice)/parsePackSize(itemInfo.rawPackSize) - parseFloat(alt.packPrice)/parsePackSize(alt.packSize)) * alt.quantity).toFixed(2)} for patient</span>
                                  </div>
                               </div>
                               <div className="flex items-center gap-6">
                                  <button 
                                    onClick={() => selectMedication(pItem.prescriptionItemId, null, false)}
                                    className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest flex items-center gap-1 transition-colors"
                                  >
                                    <Trash2 size={12} /> Revert
                                  </button>
                               </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Suggestions Overlay */}
              {altSearch.itemId && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-fade-in">
                   <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                      <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                         <div>
                            <h3 className="text-lg font-black uppercase tracking-tight text-white">Salt-Matched Alternatives</h3>
                            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em] flex items-center gap-2">
                               Query: {altSearch.salt} 
                               <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
                               <span className="text-white">Global Catalog View</span>
                            </p>
                         </div>
                         <button onClick={() => setAltSearch({ itemId: null, salt: '', inventory: [], medicines: [] })} className="p-2 hover:bg-white/10 rounded-full">
                           <X size={20} />
                         </button>
                      </div>
                      
                      {/* Reference Prescription Data */}
                      {altSearch.reference && (
                         <div className="bg-indigo-900/50 border-b border-indigo-400/20 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="flex flex-col">
                                  <span className="text-[8px] font-black text-indigo-300 uppercase tracking-widest">Doctor Wrote (Reference)</span>
                                  <span className="text-xs font-black text-white">{altSearch.reference.rawName} {altSearch.reference.rawStrength} • {altSearch.reference.rawForm}</span>
                               </div>
                               <div className="h-8 w-px bg-white/10"></div>
                               <div className="flex flex-col">
                                  <span className="text-[8px] font-black text-indigo-300 uppercase tracking-widest">Prescribed Qty</span>
                                  <span className="text-xs font-black text-white">{altSearch.reference.quantity} Units</span>
                               </div>
                            </div>
                            <div className="text-right">
                               <span className="text-[8px] font-black text-indigo-300 uppercase tracking-widest block">Doc Unit Price</span>
                               <span className="text-xs font-black text-white">Rs. {(parseFloat(altSearch.reference.originalPrice) / parsePackSize(altSearch.reference.rawPackSize)).toFixed(2)}</span>
                            </div>
                         </div>
                       )}
                      
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {altSearch.inventoryLoading ? (
                          <div className="p-20 text-center"><div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto"></div></div>
                        ) : altSearch.medicines?.length === 0 ? (
                           <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">No matching salt found in catalog.</div>
                        ) : (
                           altSearch.medicines.map(med => {
                             const prescribed = altSearch.reference;
                             const prescribedUnitPrice = parseFloat(prescribed.originalPrice) / parsePackSize(prescribed.rawPackSize);
                             const altUnitPrice = parseFloat(med.mrp) / parsePackSize(med.packSize);
                             const unitSavings = prescribedUnitPrice - altUnitPrice;
                             const totalSavings = (unitSavings * prescribed.quantity).toFixed(2);

                             return (
                               <button 
                                 key={med.id}
                                 onClick={() => selectMedication(altSearch.itemId, med)}
                                 className="w-full text-left p-5 border border-slate-100 rounded-2xl bg-white hover:border-emerald-500 hover:shadow-xl transition-all group flex items-center justify-between"
                               >
                                  <div className="flex-1">
                                     <div className="flex items-center gap-2 mb-1">
                                       <span className="text-sm font-black text-slate-900">{med.name}</span>
                                       <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 rounded-full uppercase tracking-tighter">{med.strength}</span>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <Globe size={12} className="text-slate-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                          {med.manufacturer} • MRP Rs. {med.mrp}
                                        </span>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     {unitSavings > 0 ? (
                                        <div className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-4 py-2 rounded-xl uppercase shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                           Save Rs. {totalSavings}
                                        </div>
                                     ) : (
                                        <div className="bg-slate-100 text-slate-500 text-[10px] font-black px-4 py-2 rounded-xl uppercase">
                                           No Savings
                                        </div>
                                     )}
                                  </div>
                               </button>
                             );
                           })
                        )}
                      </div>
                   </div>
                </div>
              )}

              <footer className="min-h-20 lg:h-24 bg-white border-t border-slate-100 sticky bottom-0 z-50 px-4 lg:px-12 py-3 lg:py-0 flex flex-col lg:flex-row items-center justify-between shadow-[0_-12px_40px_-15px_rgba(0,0,0,0.05)] gap-4 lg:gap-0">
                  {/* Part 1: Description (30%) */}
                  <div className="flex flex-col text-center lg:text-left lg:w-[30%]">
                     <p className="text-[8px] lg:text-xs font-bold text-slate-500 max-w-[250px] lg:max-w-none">Optimized for patient savings and salt accuracy.</p>
                  </div>

                  {/* Part 2: Total Savings (30%) */}
                  <div className="flex flex-col items-center lg:items-center lg:w-[30%]">
                     <span className="text-[8px] lg:text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-0.5 whitespace-nowrap">Total Savings</span>
                     <div className="flex items-baseline gap-1.5">
                        <span className="text-[10px] lg:text-sm font-black text-emerald-600">Rs.</span>
                        <span className="text-xl lg:text-4xl font-black text-slate-900 tabular-nums tracking-tighter">
                           {calculateSavings().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                     </div>
                  </div>

                  {/* Part 3: Action Button (40%) */}
                  <div className="w-full lg:w-[40%] flex justify-center lg:justify-end">
                    <button 
                      onClick={handleProposalSubmit}
                      className="w-full lg:w-[80%] h-12 lg:h-16 bg-slate-900 text-white rounded-xl lg:rounded-2xl text-[9px] lg:text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-emerald-600 transition-all"
                    >
                      Transmit Proposal
                    </button>
                  </div>
               </footer>
            </div>
          )}
        </section>
      </main>

      <style>{`
        .pattern-grid {
           background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
           background-size: 30px 30px;
        }
      `}</style>
      {/* ── PARTIAL FULFILLMENT CONFIRMATION MODAL ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col items-center text-center p-10 relative">
              <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 mb-8 border border-amber-100/50 shadow-inner">
                 <AlertCircle size={40} strokeWidth={2.5} className="animate-pulse" />
              </div>
              
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">Incomplete Submission</h3>
              <p className="text-sm font-semibold text-slate-500 leading-relaxed mb-10 text-balance">
                Some clinical items have no alternatives selected. Are you sure you want to transmit this partial fulfillment to the patient?
              </p>

              <div className="flex flex-col w-full gap-3">
                 <button 
                   onClick={() => {
                     setShowConfirmModal(false);
                     performActualSubmit();
                   }}
                   className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95"
                 >
                    Transmit Anyway
                 </button>
                 <button 
                   onClick={() => setShowConfirmModal(false)}
                   className="w-full py-5 bg-white border border-slate-200 text-slate-500 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all active:scale-95"
                 >
                    Return to Selection
                 </button>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 w-full flex items-center justify-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrative Guard Active</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
