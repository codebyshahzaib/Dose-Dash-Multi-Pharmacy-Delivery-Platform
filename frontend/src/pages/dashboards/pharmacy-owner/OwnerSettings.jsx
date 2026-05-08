import { useState, useEffect } from 'react';
import { apiRequest } from '../../../api/client';

export default function OwnerSettings() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    name: '', address: '', city: '', latitude: '', longitude: '', phone: '', licenseNumber: '', isActive: true
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/pharmacy-owner/settings');
      const p = res.pharmacy || {};
      setSettings({
        name: p.name || '',
        address: p.address || '',
        city: p.city || '',
        latitude: p.latitude ?? '',
        longitude: p.longitude ?? '',
        phone: p.phone || '',
        licenseNumber: p.licenseNumber || '',
        isActive: p.isActive ?? true
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/pharmacy-owner/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      setMessage({ type: 'success', text: 'Business profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-10 max-w-5xl pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Business Profile</h2>
           <p className="text-sm text-slate-500 mt-1">Manage your pharmacy identity and GIS logistics.</p>
        </div>
        
        {message && (
          <div className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all animate-fade-in ${message.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
            {message.text}
          </div>
        )}
      </div>

      <form onSubmit={handleUpdate} className="space-y-8">
         <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-2">
               <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-lg shadow-inner">🏢</div>
               <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Public Identity</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="group/field">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2 group-focus-within/field:text-indigo-600 transition-colors">Pharmacy Display Name</label>
                  <input type="text" required value={settings.name} onChange={e=>setSettings({...settings, name: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-5 py-3.5 text-sm font-bold outline-none transition-all shadow-inner" />
               </div>
               <div className="group/field">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2 group-focus-within/field:text-indigo-600 transition-colors">Drug License No.</label>
                  <input type="text" value={settings.licenseNumber} onChange={e=>setSettings({...settings, licenseNumber: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-5 py-3.5 text-sm font-bold outline-none transition-all shadow-inner" />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="group/field">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2 group-focus-within/field:text-indigo-600 transition-colors">Support Contact</label>
                  <input type="tel" required value={settings.phone} onChange={e=>setSettings({...settings, phone: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-5 py-3.5 text-sm font-bold outline-none transition-all shadow-inner tabular-nums" />
               </div>
               <div className="group/field">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2 group-focus-within/field:text-indigo-600 transition-colors">Service Region (City)</label>
                  <input type="text" required value={settings.city} onChange={e=>setSettings({...settings, city: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-5 py-3.5 text-sm font-bold outline-none transition-all shadow-inner" />
               </div>
            </div>

            <div className="group/field">
               <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2 group-focus-within/field:text-indigo-600 transition-colors">Street Address</label>
               <textarea rows="3" required value={settings.address} onChange={e=>setSettings({...settings, address: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-5 py-3.5 text-sm font-bold outline-none transition-all shadow-inner resize-none"></textarea>
            </div>
         </div>

         <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-2">
               <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-lg shadow-inner">📍</div>
               <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Geospatial Logistics</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="group/field">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Latitude Coordinates</label>
                  <input type="number" step="any" required value={settings.latitude} onChange={e=>setSettings({...settings, latitude: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-xl px-5 py-3.5 text-sm font-bold font-mono outline-none transition-all shadow-inner" />
               </div>
               <div className="group/field">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Longitude Coordinates</label>
                  <input type="number" step="any" required value={settings.longitude} onChange={e=>setSettings({...settings, longitude: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-xl px-5 py-3.5 text-sm font-bold font-mono outline-none transition-all shadow-inner" />
               </div>
            </div>
         </div>

         <button type="submit" className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all duration-300 shadow-lg active:scale-[0.98]">
            Commit Strategic Profile Updates
         </button>
      </form>
    </div>
  );
}
