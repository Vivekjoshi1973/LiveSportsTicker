const Skeleton = ({ type = 'card', count = 6 }) => {
  if (type === 'card') {
    return (
      <div className="skeleton-grid">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="skeleton-card">
            <div className="skeleton-header">
              <div className="skeleton-line skeleton-badge"></div>
            </div>
            <div className="skeleton-body">
              <div className="skeleton-team">
                <div className="skeleton-line skeleton-name"></div>
                <div className="skeleton-line skeleton-score"></div>
              </div>
              <div className="skeleton-team">
                <div className="skeleton-line skeleton-name"></div>
                <div className="skeleton-line skeleton-score"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className="skeleton-detail">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-subtitle"></div>
        <div className="skeleton-stats">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton-stat">
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="skeleton-table">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="skeleton-table-row">
            <div className="skeleton-line" style={{ width: '30px' }}></div>
            <div className="skeleton-line" style={{ width: '200px' }}></div>
            <div className="skeleton-line" style={{ width: '30px' }}></div>
            <div className="skeleton-line" style={{ width: '30px' }}></div>
            <div className="skeleton-line" style={{ width: '30px' }}></div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default Skeleton;
