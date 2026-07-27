export function SkeletonLine({ width = '100%', height = '1rem', className = '' }) {
  return (
    <div
      className={`placeholder-glow ${className}`}
      style={{ width }}
    >
      <span className="placeholder col-12" style={{ height, display: 'block', borderRadius: '4px' }}></span>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card border-0 shadow-sm p-3 mb-3">
      <SkeletonLine width="40%" height="0.9rem" className="mb-2" />
      <SkeletonLine width="70%" height="1.5rem" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <td><SkeletonLine width="60%" /></td>
              <td><SkeletonLine width="40%" /></td>
              <td><SkeletonLine width="30%" /></td>
              <td><SkeletonLine width="20%" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
