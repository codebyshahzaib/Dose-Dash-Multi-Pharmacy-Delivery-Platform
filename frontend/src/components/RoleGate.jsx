import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

export default function RoleGate({ allowedRoles, children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}