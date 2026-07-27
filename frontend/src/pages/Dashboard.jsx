import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { SERVICE_CATEGORIES } from '../config/constants';
import { SkeletonCard, SkeletonTable } from '../components/Skeleton';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function Dashboard() {
  const { user } = useAuth();
  const { wallet } = useWallet();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient
      .get('/services/history?limit=5')
      .then(({ data }) => setHistory(data.data))
      .finally(() => setLoading(false));
  }, []);

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Spending',
        data: [1200, 1900, 800, 2400, 1600, 2100, 1300],
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13,110,253,0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div>
      <h4 className="fw-bold mb-1">Welcome back, {user?.profile?.firstName || 'there'} 👋</h4>
      <p className="text-secondary mb-4">Here's what's happening with your account.</p>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          {wallet ? (
            <div className="card border-0 shadow-sm bg-primary bg-gradient text-white h-100">
              <div className="card-body">
                <p className="mb-1 opacity-75 small">Wallet Balance</p>
                <h3 className="fw-bold mb-3">&#8358;{Number(wallet.balance).toLocaleString()}</h3>
                <Link to="/wallet" className="btn btn-light btn-sm">Fund Wallet</Link>
              </div>
            </div>
          ) : <SkeletonCard />}
        </div>
        <div className="col-6 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="mb-1 text-secondary small">Account Status</p>
              <h5 className="fw-bold mb-0">
                {user?.isEmailVerified ? (
                  <span className="text-success"><i className="bi bi-patch-check-fill me-1"></i>Verified</span>
                ) : (
                  <span className="text-warning"><i className="bi bi-exclamation-triangle-fill me-1"></i>Unverified</span>
                )}
              </h5>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <p className="mb-1 text-secondary small">Recent Orders</p>
              <h5 className="fw-bold mb-0">{history?.length ?? '—'}</h5>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h6 className="fw-bold mb-3">Spending Overview</h6>
          <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} height={90} />
        </div>
      </div>

      <h6 className="fw-bold mb-3">Quick Services</h6>
      <div className="row g-3 mb-4">
        {Object.entries(SERVICE_CATEGORIES).map(([key, svc]) => (
          <div className="col-6 col-md-3 col-lg-2" key={key}>
            <Link to={`/services/${key.toLowerCase()}`} className="card border-0 shadow-sm text-decoration-none h-100 text-center py-3">
              <i className={`bi ${svc.icon} fs-3 text-primary mb-2`}></i>
              <small className="text-body fw-medium">{svc.label}</small>
            </Link>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold mb-0">Recent Activity</h6>
            <Link to="/history" className="small">View all</Link>
          </div>
          {loading ? <SkeletonTable rows={3} /> : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead><tr><th>Service</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {history?.length ? history.map((o) => (
                    <tr key={o.id}>
                      <td>{o.service?.name}</td>
                      <td>&#8358;{Number(o.totalAmount).toLocaleString()}</td>
                      <td><span className={`badge text-bg-${o.status === 'SUCCESS' ? 'success' : o.status === 'PENDING' || o.status === 'PROCESSING' ? 'warning' : 'danger'}`}>{o.status}</span></td>
                      <td className="text-secondary small">{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="text-center text-secondary py-3">No orders yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
