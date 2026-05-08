import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ROLE_HOME } from './utils/roleRoutes';

import Login                  from './pages/auth/Login';
import Register               from './pages/auth/Register';
import ProtectedRoute         from './components/ProtectedRoute';

import CustomerDashboard      from './pages/dashboards/CustomerDashboard';

// Customer Pages
import CustomerOverview      from './pages/dashboards/customer/CustomerOverview';
import PrescriptionUpload    from './pages/dashboards/customer/PrescriptionUpload';
import ProposalManager       from './pages/dashboards/customer/ProposalManager';
import OrderTracking         from './pages/dashboards/customer/OrderTracking';
import ActivePrescriptions  from './pages/dashboards/customer/ActivePrescriptions';

// Pharmacist Pages
import PharmacistLayout    from './components/PharmacistLayout';
import PharmacistOverview  from './pages/dashboards/pharmacist/PharmacistOverview';
import ActiveQuotes        from './pages/dashboards/pharmacist/ActiveQuotes';
import QuoteHistory        from './pages/dashboards/pharmacist/QuoteHistory';

// Pharmacy Owner Pages
import PharmacyOwnerLayout from './components/PharmacyOwnerLayout';
import OwnerOverview       from './pages/dashboards/pharmacy-owner/OwnerOverview';
import OwnerInventory      from './pages/dashboards/pharmacy-owner/OwnerInventory';
import OwnerOrders         from './pages/dashboards/pharmacy-owner/OwnerOrders';
import OwnerSettings       from './pages/dashboards/pharmacy-owner/OwnerSettings';
import AttachedRidersPage  from './pages/dashboards/pharmacy-owner/AttachedRidersPage';

// Rider Pages
import RiderLayout     from './components/RiderLayout';
import RiderOverview   from './pages/dashboards/rider/RiderOverview';

// Admin Pages
import AdminLayout          from './components/AdminLayout';
import AdminOverview        from './pages/dashboards/admin/AdminOverview';
import AdminPharmacists     from './pages/dashboards/admin/AdminPharmacists';
import AdminUsers           from './pages/dashboards/admin/AdminUsers';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-teal-400 border-t-transparent animate-spin" />
          <p className="text-slate-400 font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root — redirect based on auth state */}
      <Route
        path="/"
        element={<Navigate to={user ? ROLE_HOME[user.role] : '/login'} replace />}
      />

      {/* Public routes */}
      <Route path="/login"    element={user ? <Navigate to={ROLE_HOME[user.role]} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={ROLE_HOME[user.role]} replace /> : <Register />} />

      {/* Protected routes — each role gets ONLY its own dashboard */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="pharmacists" element={<AdminPharmacists />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
        <Route path="/customer" element={<CustomerDashboard />}>
          <Route index element={<CustomerOverview />} />
          <Route path="upload" element={<PrescriptionUpload />} />
          <Route path="prescriptions" element={<ActivePrescriptions />} />
          <Route path="proposals" element={<ProposalManager />} />
          <Route path="orders" element={<OrderTracking />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['PHARMACIST']} />}>
        <Route path="/pharmacist" element={<PharmacistLayout />}>
          <Route index element={<PharmacistOverview />} />
          <Route path="quotes" element={<ActiveQuotes />} />
          <Route path="history" element={<QuoteHistory />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['PHARMACY_OWNER']} />}>
        <Route path="/pharmacy-owner" element={<PharmacyOwnerLayout />}>
          <Route index element={<OwnerOverview />} />
          <Route path="inventory" element={<OwnerInventory />} />
          <Route path="orders" element={<OwnerOrders />} />
          <Route path="riders" element={<AttachedRidersPage />} />
          <Route path="settings" element={<OwnerSettings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['RIDER']} />}>
        <Route path="/rider" element={<RiderLayout />}>
          <Route index element={<RiderOverview />} />
        </Route>
      </Route>

      {/* Catch-all — redirect to login */}
      <Route path="*" element={<Navigate to={user ? ROLE_HOME[user.role] : '/login'} replace />} />
    </Routes>
  );
}