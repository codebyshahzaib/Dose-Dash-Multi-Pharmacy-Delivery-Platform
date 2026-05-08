import { useState, useEffect } from 'react';
import { apiRequest } from '../../../api/client';

export default function OwnerOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ inventory: 0, orders: 0 });
  const [settings, setSettings] = useState({ name: '', city: '', isActive: true });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, invRes, orderRes] = await Promise.all([
        apiRequest('/pharmacy-owner/settings'),
        apiRequest('/pharmacy-owner/inventory'),
        apiRequest('/pharmacy-owner/orders'),
      ]);
      
      const pharmacyData = settingsRes.pharmacy || {};
      setSettings({
        name: pharmacyData.name || '',
        city: pharmacyData.city || '',
        isActive: pharmacyData.isActive ?? true
      });
      setStats({
        inventory: invRes.inventory?.length || 0,
        orders: orderRes.orders?.length || 0
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStoreStatus = async (status) => {
    try {
      await apiRequest('/pharmacy-owner/settings', {
        method: 'PUT',
        body: JSON.stringify({ ...settings, isActive: status })
      });
      setSettings(prev => ({ ...prev, isActive: status }));
      setMessage({ type: 'success', text: `Store is now ${status ? 'ONLINE' : 'OFFLINE'}` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update status' });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-10 max-w-7xl pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Workbench Overview</h2>
           <p className="text-sm text-slate-500 mt-1">Real-time operational control and performance metrics.</p>
        </div>
        
        {message && (
          <div className={`px-4 py-2 rounded-lg text-xs font-bold border animate-fade-in ${message.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Live Store Status - Refined */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-full bg-slate-50/50 -skew-x-12 translate-x-16 group-hover:translate-x-10 transition-transform duration-1000"></div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="relative">
             <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl shadow-inner transition-all duration-500 ${settings.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {settings.isActive ? '⚡' : '🌙'}
             </div>
             <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${settings.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Clinic Status</p>
            <p className={`text-xl font-bold ${settings.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {settings.isActive ? 'Online & Receiving Orders' : 'Store Currently Offline'}
            </p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 relative z-10">
          <button 
            onClick={() => toggleStoreStatus(true)}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${settings.isActive ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            GO ONLINE
          </button>
          <button 
            onClick={() => toggleStoreStatus(false)}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${!settings.isActive ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            GO OFFLINE
          </button>
        </div>
      </div>

      {/* Stats Grid - Standardized with Icon Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Catalog', val: stats.inventory, sub: 'Verified SKUs', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: '💊' },
          { label: 'Pending Orders', val: stats.orders, sub: 'In Queue', color: 'text-amber-600', bg: 'bg-amber-50', icon: '⏳' },
          { label: 'Today\'s Sales', val: 'Rs. 0', sub: 'Gross Revenue', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '💰' },
          { label: 'Operational Status', val: settings.isActive ? 'Active' : 'Standby', sub: 'Hub Power', color: 'text-slate-600', bg: 'bg-slate-50', icon: '⚡' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md hover:border-indigo-100 transition-all group">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500`}>
               {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.val}</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
}
