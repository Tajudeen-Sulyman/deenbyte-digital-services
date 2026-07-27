export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-body-tertiary p-3">
      <div className="card shadow-sm border-0" style={{ maxWidth: '440px', width: '100%' }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-gradient rounded-circle mb-3" style={{ width: 56, height: 56 }}>
              <i className="bi bi-lightning-charge-fill text-white fs-3"></i>
            </div>
            <h4 className="fw-bold mb-1">{title}</h4>
            {subtitle && <p className="text-secondary small mb-0">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
