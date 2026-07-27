import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import axiosClient from '../../api/axiosClient';
import { SkeletonCard } from '../../components/Skeleton';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axiosClient.get('/admin/dashboard').then(({ data }) => setData(data.data));
  }, []);

  if (!data) {
    return (
      <div className="row g-3">
        {[1, 2, 3, 4].map((i) => <div className="col-6 col-md-3" key={i}><SkeletonCard /></div>)}
      </div>
    );
  }

  const { stats, revenueTrend } = data;
  const labels = Object.keys(revenueTrend).sort();
  const chartData = {
    labels,
    datasets: [{ label: 'Revenue', data: labels.map((l) => revenueTrend[l]), borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,0.1)', fill: true, tension: 0.3 }]
  };

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: 'bi-people', color: 'primary' },
    { label: 'Active Users', value: stats.activeUsers, icon: 'bi-person-check', color: 'success' },
    { label: 'Total Wallet Balance', value: `₦${Number(stats.totalWalletBalance).toLocaleString()}`, icon: 'bi-wallet2', color: 'info' },
    { label: "Today's Revenue", value: `₦${Number(stats.todayRevenue).toLocaleString()}`, icon: 'bi-graph-up-arrow', color: 'success' },
    { label: 'Total Orders', value: stats.totalOrders, icon: 'bi-receipt', color: 'secondary' },
    { label: 'Success Rate', value: `${stats.successRate}%`, icon: 'bi-check-circle', color: 'success' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: 'bi-hourglass-split', color: 'warning' }
  ];

  return (
    <div>
      <h4 className="fw-bold mb-4">Admin Dashboard</h4>
      <div className="row g-3 mb-4">
        {cards.map((c) => (
          <div className="col-6 col-md-4 col-lg-3" key={c.label}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <i className={`bi ${c.icon} text-${c.color} fs-4 mb-2 d-block`}></i>
                <p className="text-secondary small mb-1">{c.label}</p>
                <h5 className="fw-bold mb-0">{c.value}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h6 className="fw-bold mb-3">Revenue Trend (14 days)</h6>
          {labels.length ? <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} /> : <p className="text-secondary">No revenue data yet.</p>}
        </div>
      </div>
    </div>
  );
}
