import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosClient from '../../api/axiosClient';
import AuthLayout from './AuthLayout';

const schema = z.object({
  password: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Add an uppercase letter').regex(/[0-9]/, 'Add a number'),
  confirmPassword: z.string()
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    if (!token) return toast.error('Invalid or missing reset token.');
    setSubmitting(true);
    try {
      await axiosClient.post('/auth/reset-password', { token, password: values.password });
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="Choose a new, strong password">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-3">
          <label className="form-label">New password</label>
          <input type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`} {...register('password')} />
          {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
        </div>
        <div className="mb-4">
          <label className="form-label">Confirm new password</label>
          <input type="password" className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`} {...register('confirmPassword')} />
          {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
        </div>
        <button type="submit" className="btn btn-primary w-100 py-2" disabled={submitting}>
          {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
          Reset Password
        </button>
      </form>
    </AuthLayout>
  );
}
