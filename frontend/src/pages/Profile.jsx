import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/constants';

const profileSchema = z.object({
  firstName: z.string().min(2, 'At least 2 characters'),
  lastName: z.string().min(2, 'At least 2 characters'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional()
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Add an uppercase letter').regex(/[0-9]/, 'Add a number')
});

export default function Profile() {
  const { user, refreshMe } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      address: user?.profile?.address || '',
      city: user?.profile?.city || '',
      state: user?.profile?.state || ''
    }
  });

  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  const onSaveProfile = async (values) => {
    setSavingProfile(true);
    try {
      await axiosClient.patch('/users/me', values);
      await refreshMe();
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (values) => {
    setSavingPassword(true);
    try {
      await axiosClient.post('/auth/change-password', values);
      toast.success('Password changed successfully.');
      passwordForm.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed.');
    } finally {
      setSavingPassword(false);
    }
  };

  const onAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      await axiosClient.post('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refreshMe();
      toast.success('Avatar updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Avatar upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const avatarUrl = user?.profile?.avatarUrl ? `${API_BASE_URL.replace('/api', '')}${user.profile.avatarUrl}` : null;

  return (
    <div>
      <h4 className="fw-bold mb-4">Profile & Security</h4>

      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body">
              <div className="position-relative d-inline-block mb-3">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="rounded-circle" width={100} height={100} style={{ objectFit: 'cover' }} />
                ) : (
                  <div className="rounded-circle bg-primary bg-gradient d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: 100, height: 100, fontSize: '2rem' }}>
                    {user?.profile?.firstName?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <button
                  className="btn btn-sm btn-primary rounded-circle position-absolute bottom-0 end-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  aria-label="Change avatar"
                >
                  <i className="bi bi-camera-fill"></i>
                </button>
                <input type="file" accept="image/png,image/jpeg,image/webp" hidden ref={fileInputRef} onChange={onAvatarSelect} />
              </div>
              <h6 className="fw-bold mb-0">{user?.profile?.firstName} {user?.profile?.lastName}</h6>
              <p className="text-secondary small mb-2">{user?.email}</p>
              <span className={`badge text-bg-${user?.isEmailVerified ? 'success' : 'warning'}`}>
                {user?.isEmailVerified ? 'Email Verified' : 'Email Not Verified'}
              </span>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Edit Profile</h6>
              <form onSubmit={profileForm.handleSubmit(onSaveProfile)} noValidate>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">First name</label>
                    <input className="form-control" {...profileForm.register('firstName')} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last name</label>
                    <input className="form-control" {...profileForm.register('lastName')} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Address</label>
                    <input className="form-control" {...profileForm.register('address')} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">City</label>
                    <input className="form-control" {...profileForm.register('city')} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">State</label>
                    <input className="form-control" {...profileForm.register('state')} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary mt-3" disabled={savingProfile}>
                  {savingProfile ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                  Save Changes
                </button>
              </form>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Change Password</h6>
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} noValidate>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Current password</label>
                    <input type="password" className={`form-control ${passwordForm.formState.errors.currentPassword ? 'is-invalid' : ''}`} {...passwordForm.register('currentPassword')} />
                    {passwordForm.formState.errors.currentPassword && <div className="invalid-feedback">{passwordForm.formState.errors.currentPassword.message}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">New password</label>
                    <input type="password" className={`form-control ${passwordForm.formState.errors.newPassword ? 'is-invalid' : ''}`} {...passwordForm.register('newPassword')} />
                    {passwordForm.formState.errors.newPassword && <div className="invalid-feedback">{passwordForm.formState.errors.newPassword.message}</div>}
                  </div>
                </div>
                <button type="submit" className="btn btn-outline-primary mt-3" disabled={savingPassword}>
                  {savingPassword ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
