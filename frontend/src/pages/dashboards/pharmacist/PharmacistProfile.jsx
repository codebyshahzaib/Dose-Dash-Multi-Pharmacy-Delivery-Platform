import { useState, useEffect } from 'react';
import { apiRequest } from '../../../api/client';
import { 
  UserCircle, 
  MapPin, 
  Briefcase, 
  ShieldCheck, 
  Save, 
  Loader2,
  Lock,
  Stethoscope,
  Activity
} from 'lucide-react';

export default function PharmacistProfile() {
  const [profile, setProfile] = useState({
    name: '',
    licenseNumber: '',
    specialization: '',
    city: '',
    experienceYears: '',
    isAvailable: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiRequest('/pharmacists/profile');
      if (res.profile) {
        setProfile({
          name: res.profile.user?.name || '',
          licenseNumber: res.profile.licenseNumber || '',
          specialization: res.profile.specialization || '',
          city: res.profile.city || '',
          experienceYears: res.profile.experienceYears || '',
          isAvailable: res.profile.isAvailable || false,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await apiRequest('/pharmacists/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
      setMessage({ type: 'success', text: 'Profile updated.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Update failed.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async () => {
    const updatedStatus = !profile.isAvailable;
    setProfile({ ...profile, isAvailable: updatedStatus });
    
    try {
      await apiRequest('/pharmacists/profile', {
        method: 'PUT',
        body: JSON.stringify({ ...profile, isAvailable: updatedStatus }),
      });
      setMessage({ type: 'success', text: updatedStatus ? 'Status: Active' : 'Status: Offline' });
    } catch (err) {
      setProfile({ ...profile, isAvailable: !updatedStatus });
      setMessage({ type: 'error', text: 'Sync failed.' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-slate-400 mb-4" size={32} />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Records...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Professional Profile</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your license and practicing status.</p>
        </div>
        
        {message && (
          <div className={`px-4 py-2 rounded-lg text-xs font-bold border ${
            message.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
          }`}>
             {message.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Identity Form */}
         <div className="lg:col-span-8 bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
            <form onSubmit={handleUpdate} className="space-y-8">
               {/* Basic Profile */}
               <section>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <UserCircle size={16} className="text-slate-400" />
                    Core Credentials
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Full Legal Name</label>
                        <input 
                           type="text" 
                           value={profile.name}
                           onChange={e => setProfile({...profile, name: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition-all"
                           required
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">License Number</label>
                        <div className="relative">
                           <input 
                              type="text" 
                              value={profile.licenseNumber}
                              onChange={e => setProfile({...profile, licenseNumber: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white rounded-lg px-4 py-2.5 text-sm font-bold text-slate-800 outline-none transition-all"
                              required
                           />
                           <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        </div>
                     </div>
                  </div>
               </section>

               {/* Experience & Practice */}
               <section className="pt-8 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Stethoscope size={16} className="text-slate-400" />
                    Clinical Experience
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="md:col-span-2 space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Specialization</label>
                        <input 
                           type="text" 
                           value={profile.specialization}
                           onChange={e => setProfile({...profile, specialization: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition-all"
                           placeholder="e.g. Clinical Pharmacist"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Years Exp.</label>
                        <input 
                           type="number" 
                           value={profile.experienceYears}
                           onChange={e => setProfile({...profile, experienceYears: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-lg px-4 py-2.5 text-sm font-bold text-slate-800 outline-none transition-all"
                           required
                        />
                     </div>
                  </div>
                  
                  <div className="mt-6 space-y-2">
                     <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">City of Practice</label>
                     <div className="relative max-w-xs">
                        <input 
                           type="text" 
                           value={profile.city}
                           onChange={e => setProfile({...profile, city: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition-all pl-10"
                           required
                        />
                        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                     </div>
                  </div>
               </section>

               <div className="pt-6 border-t border-slate-100">
                  <button 
                     type="submit" 
                     disabled={saving}
                     className="bg-slate-900 text-white min-w-[200px] px-8 py-3 rounded-lg font-bold text-sm hover:bg-indigo-600 transition-all shadow-md shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                     {saving ? <Loader2 className="animate-spin" size={16} /> : (
                        <>
                           <Save size={16} />
                           Save Profile
                        </>
                     )}
                  </button>
               </div>
            </form>
         </div>

         {/* Presence Controls */}
         <aside className="lg:col-span-4 space-y-6">
            <div className={`rounded-xl p-8 border shadow-sm transition-all duration-300 ${profile.isAvailable ? 'bg-white border-emerald-200' : 'bg-slate-100 border-slate-200'}`}>
               <div className="flex flex-col items-center text-center">
                  <div className={`h-16 w-16 rounded-xl flex items-center justify-center mb-6 shadow-sm border ${profile.isAvailable ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-white text-slate-300 border-slate-200'}`}>
                     <Activity size={32} />
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Portal Status</h3>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed mb-8 px-2">
                     {profile.isAvailable 
                        ? "Your profile is active. Customers can send you new prescriptions." 
                        : "Your profile is currently offline. No new requests will be received."}
                  </p>
                  
                  <button 
                     onClick={toggleAvailability}
                     className={`w-full py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-sm border ${
                        profile.isAvailable 
                           ? 'bg-white text-rose-600 border-rose-100 hover:bg-rose-50' 
                           : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                     }`}
                  >
                     {profile.isAvailable ? 'Go Offline' : 'Go Active'}
                  </button>
               </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center border border-indigo-100">
                     <Briefcase size={18} />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Status</p>
                     <p className="text-xs font-bold text-slate-800 mt-0.5">Verified Partner</p>
                  </div>
               </div>
               <ShieldCheck size={20} className="text-emerald-500" />
            </div>
         </aside>
      </div>
    </div>
  );
}
