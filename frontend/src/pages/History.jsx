import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { SkeletonTable } from '../components/Skeleton';

export default function History() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get(`/services/history?page=${page}&limit=15`)
      .then(({ data }) => {
        setOrders(data.data);
        setTotalPages(data.meta.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h4 className="fw-bold mb-4">Order History</h4>
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? <SkeletonTable rows={8} /> : (
            <>
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead><tr><th>Reference</th><th>Service</th><th>Amount</th><th>Status</th><th>Date</th><th></th></tr></thead>
                  <tbody>
                    {orders.length ? orders.map((o) => (
                      <tr key={o.id}>
                        <td className="small font-monospace">{o.reference}</td>
                        <td>{o.service?.name}</td>
                        <td>&#8358;{Number(o.totalAmount).toLocaleString()}</td>
                        <td><span className={`badge text-bg-${o.status === 'SUCCESS' ? 'success' : o.status === 'FAILED' ? 'danger' : 'warning'}`}>{o.status}</span></td>
                        <td className="text-secondary small">{new Date(o.createdAt).toLocaleString()}</td>
                        <td><Link to={`/services/receipt/${o.id}`} className="btn btn-sm btn-outline-primary">View</Link></td>
                      </tr>
                    )) : <tr><td colSpan={6} className="text-center text-secondary py-4">No orders yet</td></tr>}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <nav className="mt-3">
                  <ul className="pagination pagination-sm justify-content-center mb-0">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
