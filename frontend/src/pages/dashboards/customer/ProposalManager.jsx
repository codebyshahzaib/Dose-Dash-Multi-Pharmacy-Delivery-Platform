import { useState, useEffect } from 'react';
import { apiRequest } from '../../../api/client';
import { 
  CheckCircle2, 
  X, 
  Inbox,
  AlertCircle
} from 'lucide-react';

import ProposalListView from './components/ProposalListView';
import ProposalDetailView from './components/ProposalDetailView';

export default function ProposalManager() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState(null);
  
  // Selection/Checkout state
  const [selectedAlts, setSelectedAlts] = useState({});
  const [selectedStockOverrides, setSelectedStockOverrides] = useState({}); // { itemId: stockId }
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState(null);

  // Pharmacy lookup state
  const [pharmacySearch, setPharmacySearch] = useState({ itemId: null, medicineId: null, options: [], loading: false });
  const [showConsent, setShowConsent] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  const utils = {
    Number: (val) => Number(val || 0)
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const res = await apiRequest('/proposals/customer');
      setProposals(res.proposals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const findPharmacyStock = async (itemId, medicineId) => {
    const city = selectedProposal?.prescription?.customer?.city;
    if (!city) return;

    setPharmacySearch({ itemId, medicineId, options: [], loading: true });
    try {
      const res = await apiRequest(`/inventory/medicine/${medicineId}?city=${city}`);
      setPharmacySearch(prev => ({ ...prev, options: res.inventory || [], loading: false }));
    } catch (err) {
      console.error(err);
      setPharmacySearch(prev => ({ ...prev, loading: false }));
    }
  };

  const optimizeFulfillment = async () => {
    if (!selectedProposal) return;
    setOptimizing(true);
    try {
      const medIds = selectedProposal.items.flatMap(item => 
        item.alternatives.map(a => a.pharmacyStock.medicineId)
      );
      const uniqueMedIds = [...new Set(medIds)];
      
      const res = await apiRequest('/inventory/optimize', {
        method: 'POST',
        body: JSON.stringify({ 
          medicineIds: uniqueMedIds, 
          city: selectedProposal.prescription.customer.city 
        })
      });

      if (res.recommendations?.length > 0) {
        const top = res.recommendations[0];
        const nextOverrides = { ...selectedStockOverrides };
        selectedProposal.items.forEach(item => {
           const match = top.items.find(si => si.medicineId === item.alternatives[0]?.pharmacyStock.medicineId);
           if (match) {
             nextOverrides[item.id] = match.id;
           }
        });
        setSelectedStockOverrides(nextOverrides);
        setMessage({ type: 'success', text: `Optimized! Using ${top.pharmacy.name} for ${top.availableCount} items.` });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOptimizing(false);
    }
  };

  const handleAction = async (proposalId, status) => {
    setProcessing(true);
    setMessage(null);
    try {
      const payload = { status };
      if (status === 'ACCEPTED') {
        payload.deliveryAddress = deliveryAddress;
        const p = proposals.find(x => x.id === proposalId);
        payload.selections = p.items
          .map(item => {
            const alternativeId = selectedAlts[item.id] || item.alternatives[0]?.id;
            const pharmacyStockId = selectedStockOverrides[item.id] || item.alternatives.find(a => a.id === alternativeId)?.pharmacyStockId;
            return {
              proposalItemId: item.id,
              alternativeId,
              pharmacyStockId
            };
          })
          .filter(s => s.alternativeId);
      }

      await apiRequest(`/proposals/${proposalId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      
      setMessage({ type: 'success', text: status === 'ACCEPTED' ? 'Order dispatched successfully.' : 'Proposal declined.' });
      setSelectedProposal(null);
      fetchProposals();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  if (selectedProposal) {
    return (
      <ProposalDetailView 
        proposal={selectedProposal}
        onBack={() => setSelectedProposal(null)}
        onAction={handleAction}
        optimizeStates={{
          optimizing,
          processing,
          deliveryAddress,
          selectedAlts,
          selectedStockOverrides,
          pharmacySearch,
          showConsent
        }}
        selectionHandlers={{
          optimizeFulfillment,
          findPharmacyStock,
          selectPharmacyForItem: (itemId, stockId) => {
            setSelectedStockOverrides(prev => ({ ...prev, [itemId]: stockId }));
            setPharmacySearch({ itemId: null, medicineId: null, options: [], loading: false });
          },
          setPharmacySearch,
          setShowConsent,
          setDeliveryAddress
        }}
        utils={utils}
      />
    );
  }

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Active Proposals</h2>
          <p className="text-sm text-slate-500 mt-1">Review pharmacological quotes from partner institutions.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-bold flex justify-between items-center shadow-sm border ${message.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
          <div className="flex items-center gap-2">
             {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
             <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="opacity-50 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {Array(3).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-slate-50 border border-slate-100 h-64 rounded-xl"></div>)}
        </div>
      ) : (
        <ProposalListView 
          proposals={proposals}
          onSelect={setSelectedProposal}
        />
      )}
    </div>
  );
}
