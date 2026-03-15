import { useState, useEffect } from 'react';
import { useAlerts } from '../../hooks/useAlerts';
import clsx from 'clsx';
import './AlertBanner.css';

const AlertBanner = () => {
  const { alerts } = useAlerts();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (alerts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % alerts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [alerts.length]);

  if (alerts.length === 0) return null;

  const currentAlert = alerts[currentIndex];

  return (
    <div className="alert-banner">
      <div className="alert-content">
        <span className="alert-icon">⚠️</span>
        <span className="alert-message">{currentAlert.message}</span>
      </div>
      <div className="alert-indicators">
        {alerts.map((_, index) => (
          <div
            key={index}
            className={clsx('indicator', { active: index === currentIndex })}
          />
        ))}
      </div>
    </div>
  );
};

export default AlertBanner;
