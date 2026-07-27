import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useWallet } from '../context/WalletContext';

export default function WalletFundCallback() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref') || searchParams.get('ref');
  const { refreshWallet } = useWallet();
  const [status, setStatus] = useState('confirming');

  useEffect(() => {
    if (!reference) {
      setStatus('error');
      return;
    }
    axiosClient
      .post('/wallet/fund/confirm', { reference })
      .then(async () => {
        await refreshWallet();
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  }, [reference, refreshWallet]);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: '60vh' }}>
      {status === 'confirming' && (
        <>
          <div className="spinner-border text-primary mb-3"></div>
          <p className="text-secondary">Confirming your payment...</p>
        </>
      )}
      {status === 'success' && (
        <>
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
          <h5 className="fw-bold mt-3">Wallet Funded Successfully!</h5>
          <Link to="/wallet" className="btn btn-primary mt-3">Back to Wallet</Link>
        </>
      )}
      {status === 'error' && (
        <>
          <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '3rem' }}></i>
          <h5 className="fw-bold mt-3">Payment Could Not Be Confirmed</h5>
          <p className="text-secondary">If you were charged, your wallet will be credited automatically once confirmed.</p>
          <Link to="/wallet" className="btn btn-outline-primary mt-3">Back to Wallet</Link>
        </>
      )}
    </div>
  );
}
