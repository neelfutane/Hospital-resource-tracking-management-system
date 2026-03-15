import './Loader.css';
import clsx from 'clsx';
const Loader = ({ size = 'medium', className }) => {
  return (
    <div className={clsx('loader-container', className)}>
      <div className={clsx('spinner', `spinner-${size}`)} />
    </div>
  );
};

export default Loader;
