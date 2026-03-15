import clsx from 'clsx';

const StatCard = ({ icon, label, value, subtitle, borderColor, className }) => {
  return (
    <div className={clsx('stat-card', className)} style={{ borderLeftColor: borderColor }}>
      <div className="stat-card-header">
        <div className="stat-card-icon">{icon}</div>
        <div className="stat-card-label">{label}</div>
      </div>
      <div className="stat-card-value">{value}</div>
      {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
    </div>
  );
};

export default StatCard;
