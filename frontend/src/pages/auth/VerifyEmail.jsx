import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import AuthLayout from './AuthLayout';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying | success | error

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    axiosClient
      .post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <AuthLayout title="Email Verification">
      {status === 'verifying' && (
        <div className="text-center py-3">
          <div className="spinner-border text-primary mb-3"></div>
          <p className="text-secondary">Verifying your email...</p>
        </div>
      )}
      {status === 'success' && (
        <div className="alert alert-success text-center">
          <i className="bi bi-check-circle fs-2 d-block mb-2"></i>
          Your email has been verified! You can now log in.
        </div>
      )}
      {status === 'error' && (
        <div className="alert alert-danger text-center">
          <i className="bi bi-x-circle fs-2 d-block mb-2"></i>
          This verification link is invalid or has expired.
        </div>
      )}
      <p className="text-center small mt-3 mb-0">
        <Link to="/login">Go to login</Link>
      </p>
    </AuthLayout>
  );
}
