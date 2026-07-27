import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import axiosClient from '../../api/axiosClient';

export default function AdminAnnouncements() {
  const [sending, setSending] = useState(false);
  const { register, handleSubmit, reset } = useForm({ defaultValues: { type: 'INFO' } });

  const onSubmit = async (values) => {
    setSending(true);
    try {
      await axiosClient.post('/admin/announcements', values);
      toast.success('Announcement sent to all users.');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send announcement.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">Announcements</h4>
      <div className="card border-0 shadow-sm" style={{ maxWidth: 560 }}>
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input className="form-control" {...register('title', { required: true })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Message</label>
              <textarea className="form-control" rows={4} {...register('message', { required: true })}></textarea>
            </div>
            <div className="mb-3">
              <label className="form-label">Type</label>
              <select className="form-select" {...register('type')}>
                <option value="INFO">Info</option>
                <option value="SUCCESS">Success</option>
                <option value="WARNING">Warning</option>
                <option value="ERROR">Error</option>
              </select>
            </div>
            <button className="btn btn-primary w-100" disabled={sending}>
              {sending ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-megaphone me-2"></i>}
              Broadcast to All Users
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
