import clsx from 'clsx';

const StatusBadge = ({ status, className }) => {
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'status-available';
      case 'occupied':
        return 'status-occupied';
      case 'maintenance':
        return 'status-maintenance';
      case 'critical':
        return 'status-critical';
      case 'in-use':
        return 'status-in-use';
      case 'cleaning':
        return 'status-cleaning';
      default:
        return 'status-available';
    }
  };

  return (
    <span 
      className={clsx(
        'status-badge',
        getStatusClass(status),
        className
      )}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
