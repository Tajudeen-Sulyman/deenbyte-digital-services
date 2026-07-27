import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient, { setAccessToken, setUnauthorizedHandler } from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
  }, [clearSession]);

  // Attempt silent refresh on first load (cookie-based)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosClient.post('/auth/refresh');
        setAccessToken(data.data.accessToken);
        const me = await axiosClient.get('/users/me');
        setUser(me.data.data);
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    })();
  }, [clearSession]);

  const login = async ({ email, password, rememberMe }) => {
    const { data } = await axiosClient.post('/auth/login', { email, password, rememberMe });
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const register = async (payload) => {
    const { data } = await axiosClient.post('/auth/register', payload);
    return data;
  };

  const logout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } finally {
      clearSession();
    }
  };

  const refreshMe = async () => {
    const me = await axiosClient.get('/users/me');
    setUser(me.data.data);
    return me.data.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshMe, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
