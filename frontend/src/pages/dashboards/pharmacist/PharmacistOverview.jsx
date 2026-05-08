import { useState, useEffect } from 'react';
import { apiRequest, secureFileUrl } from '../../../api/client';
import PharmacistEntryModal from '../../../components/PharmacistEntryModal';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  Eye, 
  ArrowRight,
  ShieldCheck,
  Activity,
  XCircle,
  FileText
} from 'lucide-react';

export default function PharmacistOverview() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModalRx, setActiveModalRx] = useState(null);
  const [message, setMessage] = useState(null);
  const [stats, setStats] = useState({
    pendingRx: 0,
    acceptedQuotes: 0,
    pendingQuotes: 0,
    rejectedQuotes: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch incoming prescriptions
      const rxRes = await apiRequest('/proposals/pharmacist/prescriptions');
      const rxList = rxRes.prescriptions || [];
      setPrescriptions(rxList);

      // Fetch proposal history for stats
      const propRes = await apiRequest('/proposals/pharmacist');
      const propList = propRes.proposals || [];
      
      setStats({
        pendingRx: rxList.length,
        acceptedQuotes: propList.filter(p => p.status === 'ACCEPTED').length,
        pendingQuotes: propList.filter(p => p.status === 'PENDING').length,
        rejectedQuotes: propList.filter(p => p.status === 'REJECTED').length
      });
    } catch (err) {
      console.error('Data sync failure', err);
    } finally {
      setLoading(false);
    }
  };

  const submitProposal = async (proposalData) => {
    try {
      await apiRequest('/proposals', {
        method: 'POST',
        body: JSON.stringify(proposalData)
      });
      setMessage({ type: 'success', text: 'Proposal transmitted.' });
      fetchDashboardData(); // Refresh all data
      setActiveModalRx(null);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Submission failed.' });
    }
  };

  return (
    <div className="animate-fade-in space-y-10 pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Prescription Management</h2>
          <p className="text-sm text-slate-500 mt-1">Review and fulfill active medical applications.</p>
        </div>
        
        {message && (
          <div className={`px-4 py-2 rounded-lg text-xs font-bold border ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* METRICS ROW - REAL DATA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Pending Rx', value: stats.pendingRx, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active Quotes', value: stats.pendingQuotes, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Accepted', value: stats.acceptedQuotes, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Declined', value: stats.rejectedQuotes, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center`}>
               <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN QUEUE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <ClipboardList size={16} className="text-slate-400" />
            Verification Queue
          </h3>
          <span className="text-[10px] font-bold bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">
            {prescriptions.length} Active
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
             Array(3).fill(0).map((_, i) => <div key={i} className="h-24 animate-pulse bg-slate-50/50" />)
          ) : prescriptions.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                 <ShieldCheck size={24} />
              </div>
              <p className="text-sm font-bold text-slate-500">Queue is currently clear.</p>
              <p className="text-xs text-slate-400 mt-1">You will be notified when new prescriptions are assigned.</p>
            </div>
          ) : (
            prescriptions.map((rx) => {
              const customerName = rx.customer?.user?.name || 'Anonymous Patient';
              return (
                <div key={rx.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-colors gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center font-bold text-lg border border-slate-200">
                      {customerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{customerName}</h4>
                      <div className="flex items-center gap-3 mt-1 text-[11px] font-medium text-slate-400">
                        <span>Ref: #RX-{rx.id}</span>
                        <span className="text-slate-200">|</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(rx.createdAt).toLocaleDateString()} at {new Date(rx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <a 
                      href={secureFileUrl(rx.fileUrl)} 
                      target="_blank" 
                      rel="noreferrer"
                      className="h-10 px-4 bg-white border border-slate-200 text-slate-600 rounded-lg flex items-center justify-center text-xs font-bold hover:bg-slate-50 transition-all gap-2"
                    >
                      <Eye size={14} />
                      View Rx
                    </a>
                    <button 
                      onClick={() => setActiveModalRx(rx)}
                      className="h-10 px-6 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-md shadow-slate-900/10"
                    >
                      Draft Quote
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {activeModalRx && (
        <PharmacistEntryModal 
          prescription={activeModalRx}
          onClose={() => setActiveModalRx(null)}
          onSubmit={submitProposal}
        />
      )}
    </div>
  );
}
