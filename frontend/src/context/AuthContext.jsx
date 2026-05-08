import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { apiRequest } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  /* Restore session from httpOnly cookie on mount */
  const loadMe = useCallback(async () => {
    try {
      const data = await apiRequest('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMe(); }, [loadMe]);

  /* Login — sets cookie server-side, stores user client-side */
  const login = useCallback(async ({ email, password }) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setUser(data.user);
    return data.user;
  }, []);

  /* Register — does NOT log in, user must go to /login afterwards */
  const register = useCallback(async (formData) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    // ⛔ Do NOT call setUser here — no session is created
    return data;
  }, []);

  /* Logout — clears cookie server-side, wipes user client-side */
  const logout = useCallback(async () => {
    await apiRequest('/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, reloadUser: loadMe }),
    [user, loading, login, register, logout, loadMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}