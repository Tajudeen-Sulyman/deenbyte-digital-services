import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import axiosClient from '../api/axiosClient';
import { useWallet } from '../context/WalletContext';
import { SkeletonTable } from '../components/Skeleton';

const schema = z.object({ amount: z.coerce.number().positive('Enter an amount greater than zero') });

export default function Wallet() {
  const { wallet, refreshWallet } = useWallet();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [funding, setFunding] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const loadHistory = () => {
    setLoading(true);
    axiosClient.get('/wallet/history?limit=15').then(({ data }) => setHistory(data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { loadHistory(); }, []);

  const onFund = async ({ amount }) => {
    setFunding(true);
    try {
      const { data } = await axiosClient.post('/wallet/fund', { amount });
      // Redirect user to the payment provider's hosted checkout page
      window.location.href = data.data.authorizationUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initialize payment.');
      setFunding(false);
    }
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">Wallet</h4>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-5">
          <div className="card border-0 shadow-sm bg-primary bg-gradient text-white mb-3">
            <div className="card-body">
              <p className="mb-1 opacity-75 small">Current Balance</p>
              <h2 className="fw-bold mb-0">&#8358;{wallet ? Number(wallet.balance).toLocaleString() : '—'}</h2>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Fund Wallet</h6>
              <form onSubmit={handleSubmit(onFund)} noValidate>
                <div className="mb-3">
                  <label className="form-label">Amount (₦)</label>
                  <input type="number" step="0.01" className={`form-control ${errors.amount ? 'is-invalid' : ''}`} {...register('amount')} placeholder="e.g. 5000" />
                  {errors.amount && <div className="invalid-feedback">{errors.amount.message}</div>}
                </div>
                <div className="d-flex gap-2 flex-wrap mb-3">
                  {[1000, 2000, 5000, 10000].map((amt) => (
                    <button type="button" key={amt} className="btn btn-outline-secondary btn-sm" onClick={() => reset({ amount: amt })}>
                      &#8358;{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={funding}>
                  {funding ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-credit-card me-2"></i>}
                  Proceed to Pay
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Transaction History</h6>
              {loading ? <SkeletonTable rows={6} /> : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead><tr><th>Description</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                      {history.length ? history.map((tx) => (
                        <tr key={tx.id}>
                          <td className="small">{tx.description}</td>
                          <td><span className={`badge text-bg-${tx.type === 'CREDIT' ? 'success' : 'secondary'}`}>{tx.type}</span></td>
                          <td className={tx.type === 'CREDIT' ? 'text-success' : 'text-danger'}>
                            {tx.type === 'CREDIT' ? '+' : '-'}&#8358;{Number(tx.amount).toLocaleString()}
                          </td>
                          <td><span className={`badge text-bg-${tx.status === 'SUCCESS' ? 'success' : tx.status === 'PENDING' ? 'warning' : 'danger'}`}>{tx.status}</span></td>
                          <td className="text-secondary small">{new Date(tx.createdAt).toLocaleDateString()}</td>
                        </tr>
                      )) : <tr><td colSpan={5} className="text-center text-secondary py-3">No transactions yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
