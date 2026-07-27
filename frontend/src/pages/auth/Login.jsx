import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { rememberMe: false }
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await login(values);
      toast.success('Welcome back!');
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your DeenByte account">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-3">
          <label className="form-label">Email address</label>
          <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} {...register('email')} autoComplete="email" />
          {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`} {...register('password')} autoComplete="current-password" />
          {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="rememberMe" {...register('rememberMe')} />
            <label className="form-check-label small" htmlFor="rememberMe">Remember me</label>
          </div>
          <Link to="/forgot-password" className="small">Forgot password?</Link>
        </div>

        <button type="submit" className="btn btn-primary w-100 py-2" disabled={submitting}>
          {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
          Log In
        </button>
      </form>

      <p className="text-center small text-secondary mt-4 mb-0">
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    </AuthLayout>
  );
}
