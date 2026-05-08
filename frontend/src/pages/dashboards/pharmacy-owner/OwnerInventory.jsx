import { useState, useEffect } from 'react';
import { apiRequest } from '../../../api/client';

export default function OwnerInventory() {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [price, setPrice] = useState('');
  const [isAddingStock, setIsAddingStock] = useState(false);
  const [message, setMessage] = useState(null);
  const [newMedicine, setNewMedicine] = useState({
    name: '', genericName: '', manufacturer: '', strength: '', form: '', category: '', packSize: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/pharmacy-owner/inventory');
      setInventory(res.inventory || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndLink = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/pharmacy-owner/inventory/new', {
        method: 'POST',
        body: JSON.stringify({ ...newMedicine, price })
      });
      setMessage({ type: 'success', text: 'Clinical record registered and linked.' });
      setIsAddingStock(false);
      resetForm();
      fetchInventory();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const resetForm = () => {
    setPrice('');
    setNewMedicine({ name: '', genericName: '', manufacturer: '', strength: '', form: '', category: '', packSize: '' });
  };

  const isFormComplete = newMedicine.name && newMedicine.genericName && newMedicine.manufacturer && newMedicine.strength && newMedicine.form && price;

  return (
    <div className="animate-fade-in space-y-12 max-w-7xl pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8 border-b border-slate-200 pb-10">
        <div className="space-y-2">
           <h2 className="text-4xl font-black text-slate-900 tracking-tightest">Inventory Hub</h2>
           <p className="text-sm text-slate-500 font-medium">Verify clinical identities and manage decentralized shop pricing.</p>
        </div>
        
        <button 
           onClick={() => { setIsAddingStock(!isAddingStock); setMessage(null); }}
           className={`px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${isAddingStock ? 'bg-slate-900 text-white shadow-slate-900/10' : 'bg-indigo-600 text-white hover:bg-slate-950 shadow-indigo-600/20'}`}
        >
           {isAddingStock ? 'View Directory' : '+ Add Medical Record'}
        </button>
      </div>

      {message && (
        <div className={`p-6 rounded-3xl border-2 flex items-center justify-between animate-fade-in ${
          message.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
        }`}>
          <div className="flex items-center gap-3">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'error' ? 'bg-rose-100' : 'bg-emerald-100'}`}>
                {message.type === 'error' ? '!' : '✓'}
             </div>
             <p className="text-xs font-black uppercase tracking-wide">{message.text}</p>
          </div>
          <button onClick={() => setMessage(null)} className="opacity-50 hover:opacity-100 font-bold">Close</button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
        
        {/* ADD STOCK PANEL */}
        {isAddingStock && (
          <div className="xl:col-span-12 2xl:col-span-4 lg:sticky lg:top-8 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
                <form onSubmit={handleCreateAndLink} className="space-y-8">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Clinical Registration</h3>
                       <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isFormComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {isFormComplete ? 'Ready to Commit' : 'Pending Details'}
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-2">
                          <div className="flex justify-between items-center px-1">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Brand Name</label>
                             <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Required</span>
                          </div>
                          <input type="text" placeholder="e.g. Panadol Forte" required value={newMedicine.name} onChange={e=>setNewMedicine({...newMedicine, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold" />
                       </div>

                       <div className="space-y-6 pt-4 border-t border-slate-50">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Salt</label>
                                   <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Reg</span>
                                </div>
                                <input type="text" placeholder="e.g. Paracetamol" required value={newMedicine.genericName} onChange={e=>setNewMedicine({...newMedicine, genericName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold" />
                             </div>
                             <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manufacturer</label>
                                   <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Reg</span>
                                </div>
                                <input type="text" placeholder="Pharma Co." required value={newMedicine.manufacturer} onChange={e=>setNewMedicine({...newMedicine, manufacturer: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold" />
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strength</label>
                                   <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Reg</span>
                                </div>
                                <input type="text" placeholder="500mg" required value={newMedicine.strength} onChange={e=>setNewMedicine({...newMedicine, strength: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Presentation</label>
                                <select required value={newMedicine.form} onChange={e=>setNewMedicine({...newMedicine, form: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold">
                                   <option value="">Select Form</option>
                                   <option value="Tablet">Tablet</option>
                                   <option value="Capsule">Capsule</option>
                                   <option value="Syrup">Syrup</option>
                                   <option value="Injection">Injection</option>
                                </select>
                             </div>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pack Size</label>
                             <input type="text" placeholder="20s" value={newMedicine.packSize} onChange={e=>setNewMedicine({...newMedicine, packSize: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (PKR)</label>
                             <input type="number" required value={price} onChange={e=>setPrice(e.target.value)} className="w-full bg-indigo-50/50 border border-indigo-100 rounded-2xl px-5 py-3 text-xs font-black text-indigo-700" />
                          </div>
                       </div>
                    </div>
                    <button type="submit" disabled={!isFormComplete} className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em] disabled:opacity-20 shadow-2xl active:scale-95 transition-all">Submit Clinical Entry</button>
                </form>
            </div>
          </div>
        )}

        {/* INVENTORY LIST - ADMINISTRATIVE TABLE */}
        <div className={isAddingStock ? 'xl:col-span-12 2xl:col-span-8' : 'xl:col-span-12'}>
           <div className="bg-white border border-slate-200 rounded-[3rem] shadow-sm flex flex-col min-h-[700px] overflow-hidden">
              <div className="flex items-center justify-between px-10 py-8 border-b border-slate-100 bg-slate-50/50">
                 <div className="space-y-1">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Verified Branch Directory</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{inventory.length} Clinical SKUs Identified</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">Live Status</span>
                 </div>
              </div>

              <div className="flex-grow overflow-x-auto overflow-y-auto max-h-[1400px] no-scrollbar">
                <table className="w-full text-left border-collapse">
                   <thead className="sticky top-0 z-20 bg-white border-b border-slate-100">
                      <tr>
                         <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Brand / Generic</th>
                         <th className="px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Manufacturer</th>
                         <th className="px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Dosage / Form</th>
                         <th className="px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Pack Size</th>
                         <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Store Price</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {inventory.length === 0 ? (
                       <tr>
                         <td colSpan="5" className="px-10 py-32 text-center opacity-40">
                           <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Repository Empty</p>
                           <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">Begin Registration to initialize stock.</p>
                         </td>
                       </tr>
                     ) : (
                       inventory.map(item => (
                         <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-10 py-6">
                               <div className="flex flex-col">
                                  <span className="font-black text-slate-900 uppercase text-xs tracking-tight group-hover:text-indigo-600 transition-colors">{item.medicine?.name}</span>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-60">{item.medicine?.salt}</span>
                               </div>
                            </td>
                            <td className="px-6 py-6">
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter bg-slate-100 px-3 py-1 rounded-lg">
                                  {item.medicine?.manufacturer || 'Unknown Pharma'}
                               </span>
                            </td>
                            <td className="px-6 py-6 font-bold text-slate-600 text-[10px] uppercase">
                               <div className="flex items-center gap-2">
                                  <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-[8px] font-black">{item.medicine?.form}</span>
                                  <span>{item.medicine?.strength}</span>
                               </div>
                            </td>
                            <td className="px-6 py-6 font-black text-slate-400 text-[10px] uppercase tracking-tighter">
                               {item.medicine?.packSize || 'Units'}
                            </td>
                            <td className="px-10 py-6 text-right">
                               <div className="flex flex-col items-end">
                                  <span className="text-sm font-black text-slate-900 tabular-nums">PKR {Number(item.price).toFixed(2)}</span>
                                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1">Ready</span>
                               </div>
                            </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                </table>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
