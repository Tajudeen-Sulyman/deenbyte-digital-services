import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { wallet } = useWallet();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body border-bottom sticky-top px-2 px-md-3">
      <div className="container-fluid">
        <button className="btn btn-link d-lg-none text-body p-1 me-2" onClick={onToggleSidebar} aria-label="Toggle menu">
          <i className="bi bi-list fs-3"></i>
        </button>

        <Link to="/dashboard" className="navbar-brand fw-bold text-primary d-flex align-items-center gap-2">
          <i className="bi bi-lightning-charge-fill"></i>
          <span className="d-none d-sm-inline">DeenByte</span>
        </Link>

        <div className="d-flex align-items-center gap-2 gap-md-3 ms-auto">
          {wallet && (
            <Link to="/wallet" className="badge text-bg-primary rounded-pill px-3 py-2 text-decoration-none">
              <i className="bi bi-wallet2 me-1"></i>
              &#8358;{Number(wallet.balance).toLocaleString()}
            </Link>
          )}

          <button className="btn btn-outline-secondary btn-sm rounded-circle" onClick={toggleTheme} aria-label="Toggle dark mode">
            <i className={`bi ${theme === 'light' ? 'bi-moon-stars' : 'bi-sun'}`}></i>
          </button>

          <div className="dropdown">
            <button className="btn btn-outline-secondary btn-sm dropdown-toggle d-flex align-items-center gap-1" data-bs-toggle="dropdown">
              <i className="bi bi-person-circle"></i>
              <span className="d-none d-md-inline">{user?.profile?.firstName || user?.email}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><Link className="dropdown-item" to="/profile"><i className="bi bi-person me-2"></i>Profile</Link></li>
              <li><Link className="dropdown-item" to="/notifications"><i className="bi bi-bell me-2"></i>Notifications</Link></li>
              <li><hr className="dropdown-divider" /></li>
              <li><button className="dropdown-item text-danger" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>Logout</button></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
