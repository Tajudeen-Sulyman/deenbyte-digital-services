import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { SkeletonCard } from '../components/Skeleton';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    axiosClient.get('/notifications?limit=30').then(({ data }) => setItems(data.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const markRead = async (id) => {
    await axiosClient.patch(`/notifications/${id}/read`);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const typeIcon = { INFO: 'bi-info-circle text-primary', SUCCESS: 'bi-check-circle text-success', WARNING: 'bi-exclamation-triangle text-warning', ERROR: 'bi-x-circle text-danger' };

  return (
    <div>
      <h4 className="fw-bold mb-4">Notifications</h4>
      {loading ? (
        <>
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </>
      ) : items.length === 0 ? (
        <div className="alert alert-light border">You have no notifications yet.</div>
      ) : (
        items.map((n) => (
          <div key={n.id} className={`card border-0 shadow-sm mb-2 ${!n.isRead ? 'border-start border-4 border-primary' : ''}`}>
            <div className="card-body d-flex gap-3 align-items-start">
              <i className={`bi ${typeIcon[n.type] || typeIcon.INFO} fs-4`}></i>
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between">
                  <h6 className="fw-bold mb-1">{n.title}</h6>
                  <small className="text-secondary">{new Date(n.createdAt).toLocaleDateString()}</small>
                </div>
                <p className="mb-1 small">{n.message}</p>
                {!n.isRead && (
                  <button className="btn btn-sm btn-link p-0" onClick={() => markRead(n.id)}>Mark as read</button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
