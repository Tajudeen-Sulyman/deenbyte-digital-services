import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosClient from '../../api/axiosClient';
import AuthLayout from './AuthLayout';

const schema = z.object({ email: z.string().email('Enter a valid email address') });

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await axiosClient.post('/auth/forgot-password', values);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Forgot password?" subtitle="We'll send you a reset link">
      {sent ? (
        <div className="alert alert-success">
          <i className="bi bi-check-circle me-2"></i>
          If an account exists for that email, a reset link is on its way.
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-4">
            <label className="form-label">Email address</label>
            <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} {...register('email')} />
            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
          </div>
          <button type="submit" className="btn btn-primary w-100 py-2" disabled={submitting}>
            {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
            Send Reset Link
          </button>
        </form>
      )}
      <p className="text-center small text-secondary mt-4 mb-0">
        <Link to="/login"><i className="bi bi-arrow-left me-1"></i>Back to login</Link>
      </p>
    </AuthLayout>
  );
}
