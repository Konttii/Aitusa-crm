import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getCurrentUser } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const login = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const current = await getCurrentUser();
      setUser(current);
      return current;
    } catch (err) {
      setUser(null);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Returning to the app must not unmount pages (unsaved forms) or log out on a network hiccup.
  const refresh = useCallback(async () => {
    try {
      setUser(await getCurrentUser());
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        setUser(null);
        setError(err.message);
      }
    }
  }, []);

  useEffect(() => {
    login().catch(() => {});
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [login, refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth requires AuthProvider');
  return context;
}
