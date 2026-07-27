import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { SkeletonCard } from '../../components/Skeleton';

export default function OrderReceipt() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.get(`/services/receipt/${orderId}`).then(({ data }) => setOrder(data.data)).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <SkeletonCard />;
  if (!order) return <div className="alert alert-danger">Receipt not found.</div>;

  const statusColor = order.status === 'SUCCESS' ? 'success' : order.status === 'FAILED' ? 'danger' : 'warning';

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-7 col-lg-5">
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-4">
            <i className={`bi ${order.status === 'SUCCESS' ? 'bi-check-circle-fill text-success' : 'bi-hourglass-split text-warning'}`} style={{ fontSize: '3rem' }}></i>
            <h5 className="fw-bold mt-3 mb-1">{order.service?.name}</h5>
            <span className={`badge text-bg-${statusColor} mb-3`}>{order.status}</span>

            <hr />
            <div className="text-start">
              <div className="d-flex justify-content-between py-1">
                <span className="text-secondary">Reference</span><span className="fw-medium">{order.reference}</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-secondary">Amount</span><span className="fw-medium">&#8358;{Number(order.amount).toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-secondary">Fee</span><span className="fw-medium">&#8358;{Number(order.fee).toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-secondary">Total</span><span className="fw-bold">&#8358;{Number(order.totalAmount).toLocaleString()}</span>
              </div>
              {order.token && (
                <div className="d-flex justify-content-between py-1">
                  <span className="text-secondary">Token / PIN</span><span className="fw-bold">{order.token}</span>
                </div>
              )}
              <div className="d-flex justify-content-between py-1">
                <span className="text-secondary">Date</span><span className="fw-medium">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-outline-secondary w-100" onClick={() => window.print()}>
                <i className="bi bi-printer me-2"></i>Print
              </button>
              <Link to="/history" className="btn btn-primary w-100">View History</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
