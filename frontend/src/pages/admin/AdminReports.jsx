import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import axiosClient from '../../api/axiosClient';
import { SkeletonCard } from '../../components/Skeleton';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function AdminReports() {
  const [reports, setReports] = useState(null);
  const [range, setRange] = useState({ from: '', to: '' });

  const load = () => {
    const params = new URLSearchParams(Object.fromEntries(Object.entries(range).filter(([, v]) => v)));
    axiosClient.get(`/admin/reports?${params}`).then(({ data }) => setReports(data.data));
  };
  useEffect(load, []); // eslint-disable-line

  if (!reports) return <SkeletonCard />;

  const chartData = {
    labels: reports.byService.map((s) => s.service),
    datasets: [{ label: 'Revenue (₦)', data: reports.byService.map((s) => s.totalRevenue), backgroundColor: '#0d6efd' }]
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="fw-bold mb-0">Reports</h4>
        <div className="d-flex gap-2">
          <input type="date" className="form-control form-control-sm" value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} />
          <input type="date" className="form-control form-control-sm" value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} />
          <button className="btn btn-sm btn-primary" onClick={load}>Filter</button>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h6 className="fw-bold mb-3">Revenue by Service</h6>
          {reports.byService.length ? <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} /> : <p className="text-secondary">No data for this period.</p>}
        </div>
      </div>

      <div className="row g-3">
        {reports.byStatus.map((s) => (
          <div className="col-6 col-md-3" key={s.status}>
            <div className="card border-0 shadow-sm text-center">
              <div className="card-body">
                <p className="text-secondary small mb-1">{s.status}</p>
                <h5 className="fw-bold mb-0">{s.count}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
