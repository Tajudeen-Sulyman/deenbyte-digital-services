import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SERVICE_CATEGORIES } from '../config/constants';

const navItemClass = ({ isActive }) =>
  `nav-link d-flex align-items-center gap-2 rounded-3 px-3 py-2 mb-1 ${isActive ? 'active bg-primary text-white' : 'text-body'}`;

export default function Sidebar({ show, onClose }) {
  const { isAdmin } = useAuth();

  return (
    <>
      {show && <div className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" style={{ zIndex: 1040 }} onClick={onClose}></div>}

      <aside
        className={`bg-body border-end position-fixed position-lg-sticky top-0 h-100 overflow-auto p-3 ${show ? 'start-0' : 'start-100 start-lg-0'}`}
        style={{ width: '260px', zIndex: 1045, transition: 'left 0.25s ease', marginTop: show ? 0 : undefined }}
      >
        <div className="d-lg-none d-flex justify-content-end mb-2">
          <button className="btn btn-sm btn-link text-body" onClick={onClose}><i className="bi bi-x-lg fs-4"></i></button>
        </div>

        <div className="text-uppercase small text-secondary fw-bold px-2 mb-2 mt-2">Main</div>
        <NavLink to="/dashboard" className={navItemClass} onClick={onClose}>
          <i className="bi bi-grid-1x2-fill"></i> Dashboard
        </NavLink>
        <NavLink to="/wallet" className={navItemClass} onClick={onClose}>
          <i className="bi bi-wallet2"></i> Wallet
        </NavLink>
        <NavLink to="/history" className={navItemClass} onClick={onClose}>
          <i className="bi bi-clock-history"></i> Transaction History
        </NavLink>
        <NavLink to="/notifications" className={navItemClass} onClick={onClose}>
          <i className="bi bi-bell"></i> Notifications
        </NavLink>

        <div className="text-uppercase small text-secondary fw-bold px-2 mb-2 mt-4">Services</div>
        {Object.entries(SERVICE_CATEGORIES).map(([key, svc]) => (
          <NavLink key={key} to={`/services/${key.toLowerCase()}`} className={navItemClass} onClick={onClose}>
            <i className={`bi ${svc.icon}`}></i> {svc.label}
          </NavLink>
        ))}

        <div className="text-uppercase small text-secondary fw-bold px-2 mb-2 mt-4">Account</div>
        <NavLink to="/profile" className={navItemClass} onClick={onClose}>
          <i className="bi bi-person"></i> Profile & Security
        </NavLink>

        {isAdmin && (
          <>
            <div className="text-uppercase small text-secondary fw-bold px-2 mb-2 mt-4">Admin</div>
            <NavLink to="/admin" end className={navItemClass} onClick={onClose}>
              <i className="bi bi-speedometer2"></i> Admin Dashboard
            </NavLink>
            <NavLink to="/admin/users" className={navItemClass} onClick={onClose}>
              <i className="bi bi-people"></i> Users
            </NavLink>
            <NavLink to="/admin/transactions" className={navItemClass} onClick={onClose}>
              <i className="bi bi-receipt"></i> Transactions
            </NavLink>
            <NavLink to="/admin/services" className={navItemClass} onClick={onClose}>
              <i className="bi bi-gear"></i> Services
            </NavLink>
            <NavLink to="/admin/reports" className={navItemClass} onClick={onClose}>
              <i className="bi bi-bar-chart"></i> Reports
            </NavLink>
            <NavLink to="/admin/announcements" className={navItemClass} onClick={onClose}>
              <i className="bi bi-megaphone"></i> Announcements
            </NavLink>
          </>
        )}
      </aside>
    </>
  );
}
