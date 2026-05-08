import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUpload } from '../../../api/client';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Lock
} from 'lucide-react';

export default function PrescriptionUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form State
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setError('File too large (Max 5MB).');
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please upload your prescription file.');

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      // No pharmacistId needed anymore - backend auto-assigns
      formData.append('notes', notes);

      await apiUpload('/prescriptions/upload', formData);
      setSuccess('Prescription dispatched to Central Pharmacist.');
      setTimeout(() => navigate('/customer/prescriptions'), 2000);
    } catch (err) {
      setError(err.message || 'Submission failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">New Medical Application</h2>
          <p className="text-sm text-slate-500 mt-1">Submit your clinical documentation for centralized verification.</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-bold">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-lg flex items-center justify-between text-sm font-bold">
          <div className="flex items-center gap-3">
             <CheckCircle size={16} />
             {success}
          </div>
          <Loader2 className="animate-spin text-emerald-600" size={16} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Verification & Context */}
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Lock size={120} />
             </div>
             
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg">
                      <Lock size={20} />
                   </div>
                   <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">System Assignment</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Status: Centralized Fulfillment Active</p>
                   </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
                   <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      Your prescription will be automatically routed to the <span className="text-indigo-600 font-black italic">Primary Verification Desk</span>. Our central pharmacist will transcribe your medicines and suggest the best possible alternatives nearby.
                   </p>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">Clinical Notes & Preferences</label>
                  <textarea 
                    className="w-full rounded-2xl border border-slate-200 p-5 bg-white shadow-inner focus:border-indigo-600 outline-none transition-all font-semibold text-slate-800 text-sm min-h-[160px] placeholder:text-slate-300" 
                    placeholder="Include generic brand preferences, allergies, or specific delivery timing instructions..." 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    disabled={uploading}
                  />
                </div>
             </div>
          </section>
        </div>

        {/* Upload & Submit */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-6">
           <section className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl flex flex-col items-center">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 opacity-20 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500 opacity-10 blur-[60px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
              
              <div className="relative z-10 w-full flex flex-col items-center">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-slate-400">Step 1: Document Portal</h3>
                
                <div 
                  onClick={() => !uploading && fileInputRef.current?.click()} 
                  className={`group w-full border-2 border-dashed rounded-[2rem] py-16 flex flex-col items-center text-center transition-all cursor-pointer ${file ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-800/30 hover:border-slate-700 hover:bg-slate-800/50'}`}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".jpg,.jpeg,.png,.webp,.pdf" disabled={uploading}/>
                  
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all shadow-2xl ${file ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                    {file ? <FileText size={36} /> : <UploadCloud size={36} />}
                  </div>
                  
                  {file ? (
                    <div className="px-6">
                      <p className="font-bold text-sm truncate max-w-[240px] mb-1">{file.name}</p>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Digital Artifact Loaded</p>
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); setFile(null); }} 
                        className="mt-8 text-rose-400 font-bold text-[10px] uppercase tracking-widest hover:text-rose-300 transition-colors py-2 px-4 border border-rose-400/20 rounded-lg hover:bg-rose-400/5"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="px-6">
                      <p className="text-sm font-bold opacity-80 group-hover:opacity-100 tracking-tight">Upload Clinical Scan</p>
                      <p className="text-[9px] text-slate-500 mt-2 uppercase tracking-widest font-black leading-relaxed">PDF, JPG, or PNG <br/> Maximum File Size: 5MB</p>
                    </div>
                  )}
                </div>
              </div>
           </section>

           <div className="space-y-4">
            <button 
              type="submit" 
              disabled={uploading || !file} 
              className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${uploading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'}`}
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Transmitting...
                </>
              ) : (
                <>
                  Initialize Discovery
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            <div className="flex items-center gap-2 justify-center text-slate-400">
               <ShieldCheck size={14} className="text-emerald-500" />
               <p className="text-[10px] font-black uppercase tracking-widest text-center">Secure Clinical Gateway Active</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
