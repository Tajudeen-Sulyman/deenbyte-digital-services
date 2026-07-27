import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { WalletProvider } from './context/WalletContext';

import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import AppLayout from './components/AppLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import WalletFundCallback from './pages/WalletFundCallback';
import Profile from './pages/Profile';
import History from './pages/History';
import Notifications from './pages/Notifications';
import ServicePurchase from './pages/services/ServicePurchase';
import OrderReceipt from './pages/services/OrderReceipt';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminServices from './pages/admin/AdminServices';
import AdminReports from './pages/admin/AdminReports';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';

import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WalletProvider>
          <ToastContainer position="top-right" autoClose={3500} newestOnTop theme="colored" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/wallet/fund/callback" element={<WalletFundCallback />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/history" element={<History />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/services/receipt/:orderId" element={<OrderReceipt />} />
                <Route path="/services/:categoryKey" element={<ServicePurchase />} />

                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/transactions" element={<AdminTransactions />} />
                  <Route path="/admin/services" element={<AdminServices />} />
                  <Route path="/admin/reports" element={<AdminReports />} />
                  <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                </Route>
              </Route>
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </WalletProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
