import React from 'react';
import { getStatusColor } from '../../utils/statusColors';

const StatusBadge = ({ status, size = 'sm' }) => {
  const colorClass = getStatusColor(status);
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${colorClass} ${sizeClasses[size]}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
