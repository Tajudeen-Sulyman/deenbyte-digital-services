import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import axiosClient from '../../api/axiosClient';
import { useWallet } from '../../context/WalletContext';
import { SERVICE_CATEGORIES } from '../../config/constants';
import { SkeletonCard } from '../../components/Skeleton';

/**
 * Generic, config-driven purchase page.
 * Every service (Airtime, Data, Electricity, Cable, NIN, BVN, CAC, WAEC, NECO, JAMB)
 * renders through this single component, using the field schema returned by the backend
 * (Service.fieldsSchema). This is how "each service has its own purchase page" is satisfied
 * without duplicating near-identical UI ten times.
 */
export default function ServicePurchase() {
  const { categoryKey } = useParams();
  const navigate = useNavigate();
  const { refreshWallet } = useWallet();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const categoryMeta = SERVICE_CATEGORIES[categoryKey?.toUpperCase()];
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (!categoryMeta) return;
    setLoading(true);
    axiosClient
      .get(`/services/${categoryMeta.code}`)
      .then(({ data }) => setService(data.data))
      .catch(() => toast.error('Could not load this service.'))
      .finally(() => setLoading(false));
    reset();
  }, [categoryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (values) => {
    if (!service) return;
    setSubmitting(true);
    try {
      const inputPayload = { ...values };
      if (inputPayload.amount) inputPayload.amount = Number(inputPayload.amount);

      const { data } = await axiosClient.post('/services/purchase', {
        serviceCode: service.code,
        amount: inputPayload.amount,
        inputPayload
      });

      await refreshWallet();
      toast.success('Purchase successful!');
      navigate(`/services/receipt/${data.data.order.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Purchase failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!categoryMeta) {
    return <div className="alert alert-warning">Unknown service category.</div>;
  }

  if (loading || !service) {
    return <SkeletonCard />;
  }

  const fields = service.fieldsSchema?.fields || [];

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-8 col-lg-6">
        <div className="d-flex align-items-center gap-2 mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-gradient rounded-3 text-white" style={{ width: 44, height: 44 }}>
            <i className={`bi ${categoryMeta.icon} fs-5`}></i>
          </div>
          <div>
            <h5 className="fw-bold mb-0">{service.name}</h5>
            <small className="text-secondary">Fee: &#8358;{Number(service.feeFlat)} {Number(service.feePercent) > 0 && `+ ${service.feePercent}%`}</small>
          </div>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {fields.map((field) => (
                <div className="mb-3" key={field.name}>
                  <label className="form-label">{field.label}</label>
                  {field.type === 'select' ? (
                    <select className="form-select" {...register(field.name, { required: field.required })}>
                      <option value="">Select {field.label}</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : field.type || 'text'}
                      step={field.type === 'number' ? '0.01' : undefined}
                      className="form-control"
                      {...register(field.name, { required: field.required })}
                    />
                  )}
                </div>
              ))}

              <button type="submit" className="btn btn-primary w-100 py-2" disabled={submitting}>
                {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check2-circle me-2"></i>}
                Purchase Now
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
