import clsx from 'clsx';

const MiniBar = ({ value, max, className }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  
  const getColorClass = (percentage) => {
    if (percentage < 65) return 'progress-good';
    if (percentage < 85) return 'progress-warning';
    return 'progress-critical';
  };

  return (
    <div className={clsx('mini-bar', className)}>
      <div className="mini-bar-track">
        <div 
          className={clsx('mini-bar-fill', getColorClass(percentage))}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span className="mini-bar-text">{Math.round(percentage)}%</span>
    </div>
  );
};

export default MiniBar;
