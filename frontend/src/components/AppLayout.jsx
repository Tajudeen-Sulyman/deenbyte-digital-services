import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useWallet } from '../context/WalletContext';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { refreshWallet } = useWallet();

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar show={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="flex-grow-1 p-3 p-md-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
