import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';

const schema = z.object({
  firstName: z.string().min(2, 'At least 2 characters'),
  lastName: z.string().min(2, 'At least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(10, 'At least 10 digits'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Add an uppercase letter')
    .regex(/[0-9]/, 'Add a number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const { confirmPassword, ...payload } = values;
      await registerUser(payload);
      toast.success('Account created! Check your email to verify your account.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join DeenByte Digital Services">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="row g-2">
          <div className="col-6 mb-3">
            <label className="form-label">First name</label>
            <input className={`form-control ${errors.firstName ? 'is-invalid' : ''}`} {...register('firstName')} />
            {errors.firstName && <div className="invalid-feedback">{errors.firstName.message}</div>}
          </div>
          <div className="col-6 mb-3">
            <label className="form-label">Last name</label>
            <input className={`form-control ${errors.lastName ? 'is-invalid' : ''}`} {...register('lastName')} />
            {errors.lastName && <div className="invalid-feedback">{errors.lastName.message}</div>}
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Email address</label>
          <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} {...register('email')} />
          {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Phone number</label>
          <input type="tel" className={`form-control ${errors.phone ? 'is-invalid' : ''}`} {...register('phone')} placeholder="080XXXXXXXX" />
          {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`} {...register('password')} />
          {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
        </div>

        <div className="mb-4">
          <label className="form-label">Confirm password</label>
          <input type="password" className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`} {...register('confirmPassword')} />
          {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
        </div>

        <button type="submit" className="btn btn-primary w-100 py-2" disabled={submitting}>
          {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
          Create Account
        </button>
      </form>

      <p className="text-center small text-secondary mt-4 mb-0">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
