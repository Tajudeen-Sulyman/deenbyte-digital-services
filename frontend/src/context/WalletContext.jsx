import { createContext, useContext, useState, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from './AuthContext';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshWallet = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/wallet');
      setWallet(data.data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return (
    <WalletContext.Provider value={{ wallet, loading, refreshWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
