import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axiosClient from '../../api/axiosClient';
import { SkeletonTable } from '../../components/Skeleton';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    axiosClient.get(`/admin/users?search=${encodeURIComponent(search)}&limit=30`).then(({ data }) => setUsers(data.data)).finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line

  const toggleActive = async (user) => {
    try {
      await axiosClient.patch(`/admin/users/${user.id}/status`, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}.`);
      load();
    } catch {
      toast.error('Failed to update user status.');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="fw-bold mb-0">Users</h4>
        <form className="d-flex gap-2" onSubmit={(e) => { e.preventDefault(); load(); }}>
          <input className="form-control form-control-sm" placeholder="Search by email or phone" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn btn-sm btn-primary">Search</button>
        </form>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? <SkeletonTable rows={8} /> : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead><tr><th>Name</th><th>Email</th><th>Wallet</th><th>Role</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.profile?.firstName} {u.profile?.lastName}</td>
                      <td className="small">{u.email}</td>
                      <td>&#8358;{Number(u.wallet?.balance || 0).toLocaleString()}</td>
                      <td><span className="badge text-bg-secondary">{u.role}</span></td>
                      <td><span className={`badge text-bg-${u.isActive ? 'success' : 'danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <button className={`btn btn-sm ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`} onClick={() => toggleActive(u)}>
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
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
