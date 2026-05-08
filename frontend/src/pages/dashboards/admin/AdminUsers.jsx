import { useState, useEffect } from 'react';
import { apiRequest } from '../../../api/client';
import { 
  Users as UsersIcon, 
  Search, 
  Mail, 
  User,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiRequest('/admin/users');
      setUsers(res.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 pb-8">
         <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">User Directory</h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">Platform-wide overview of all registered entities and their authorization levels.</p>
         </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Identity or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-600 transition-all font-outfit"
          />
        </div>
        <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 italic">
           <UsersIcon size={18} className="text-indigo-600" />
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{users.length} Systems Registered</span>
        </div>
      </div>

      {/* TABLE-LIKE LIST */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorization</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Registered</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                         <td colSpan="4" className="px-8 py-6"><div className="h-4 bg-slate-50 rounded-full w-3/4"></div></td>
                      </tr>
                    ))
                  ) : filtered.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                <User size={18} />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{u.name}</p>
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{u.email}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             u.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                             u.role === 'PHARMACIST' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                             'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                             {u.role}
                          </span>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500 shadow-md' : 'bg-rose-500'}`}></div>
                             <span className={`text-[10px] font-black uppercase tracking-widest ${u.isActive ? 'text-emerald-700' : 'text-rose-600'}`}>
                                {u.isActive ? 'Active' : 'Locked'}
                             </span>
                          </div>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2 text-slate-400">
                             <span className="text-[10px] font-bold">{new Date(u.createdAt).toLocaleDateString()}</span>
                             <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all text-indigo-500" />
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
