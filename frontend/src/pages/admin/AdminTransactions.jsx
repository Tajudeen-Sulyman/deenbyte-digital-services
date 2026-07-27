import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { SkeletonTable } from '../../components/Skeleton';

export default function AdminTransactions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', status: '' });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 30, ...(filter.type && { type: filter.type }), ...(filter.status && { status: filter.status }) });
    axiosClient.get(`/admin/transactions?${params}`).then(({ data }) => setItems(data.data)).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="fw-bold mb-0">Transactions</h4>
        <div className="d-flex gap-2">
          <select className="form-select form-select-sm" value={filter.type} onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))}>
            <option value="">All Types</option><option value="CREDIT">Credit</option><option value="DEBIT">Debit</option>
          </select>
          <select className="form-select form-select-sm" value={filter.status} onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}>
            <option value="">All Status</option><option value="SUCCESS">Success</option><option value="PENDING">Pending</option><option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? <SkeletonTable rows={10} /> : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead><tr><th>Reference</th><th>User</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {items.length ? items.map((tx) => (
                    <tr key={tx.id}>
                      <td className="small font-monospace">{tx.reference}</td>
                      <td className="small">{tx.user?.email}</td>
                      <td><span className={`badge text-bg-${tx.type === 'CREDIT' ? 'success' : 'secondary'}`}>{tx.type}</span></td>
                      <td>&#8358;{Number(tx.amount).toLocaleString()}</td>
                      <td><span className={`badge text-bg-${tx.status === 'SUCCESS' ? 'success' : tx.status === 'PENDING' ? 'warning' : 'danger'}`}>{tx.status}</span></td>
                      <td className="text-secondary small">{new Date(tx.createdAt).toLocaleString()}</td>
                    </tr>
                  )) : <tr><td colSpan={6} className="text-center text-secondary py-4">No transactions found</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
