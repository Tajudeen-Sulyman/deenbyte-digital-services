import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axiosClient from '../../api/axiosClient';
import { SkeletonTable } from '../../components/Skeleton';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    axiosClient.get('/admin/services').then(({ data }) => setServices(data.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleActive = async (svc) => {
    await axiosClient.patch(`/admin/services/${svc.id}`, { isActive: !svc.isActive });
    toast.success('Service updated.');
    load();
  };

  const saveEdit = async () => {
    await axiosClient.patch(`/admin/services/${editing.id}`, { feeFlat: Number(editing.feeFlat), feePercent: Number(editing.feePercent) });
    toast.success('Fees updated.');
    setEditing(null);
    load();
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">Services</h4>
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? <SkeletonTable rows={8} /> : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead><tr><th>Name</th><th>Category</th><th>Flat Fee</th><th>Fee %</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {services.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td><span className="badge text-bg-light border">{s.category}</span></td>
                      <td>
                        {editing?.id === s.id ? (
                          <input type="number" className="form-control form-control-sm" style={{ width: 90 }} value={editing.feeFlat} onChange={(e) => setEditing({ ...editing, feeFlat: e.target.value })} />
                        ) : `₦${s.feeFlat}`}
                      </td>
                      <td>
                        {editing?.id === s.id ? (
                          <input type="number" className="form-control form-control-sm" style={{ width: 80 }} value={editing.feePercent} onChange={(e) => setEditing({ ...editing, feePercent: e.target.value })} />
                        ) : `${s.feePercent}%`}
                      </td>
                      <td><span className={`badge text-bg-${s.isActive ? 'success' : 'secondary'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td className="d-flex gap-1">
                        {editing?.id === s.id ? (
                          <>
                            <button className="btn btn-sm btn-success" onClick={saveEdit}>Save</button>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditing(null)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => setEditing(s)}>Edit Fees</button>
                            <button className={`btn btn-sm ${s.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`} onClick={() => toggleActive(s)}>
                              {s.isActive ? 'Disable' : 'Enable'}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
