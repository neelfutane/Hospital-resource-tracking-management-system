import { Link, useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import LivePulse from './LivePulse';
import StatusBadge from './StatusBadge';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/beds', label: 'Beds', icon: '🛏️' },
    { path: '/equipment', label: 'Equipment', icon: '🏥' },
    { path: '/rooms', label: 'Rooms', icon: '🚪' },
    { path: '/logs', label: 'Activity Log', icon: '📋' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">🏥</span>
            <span className="brand-text">Hospital Tracker</span>
          </Link>
          {connected && <LivePulse />}
        </div>

        <div className="navbar-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={clsx('nav-link', { active: location.pathname === link.path })}
            >
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="navbar-user">
          {user && (
            <>
              <StatusBadge status={user.role} className="role-badge" />
              <span className="user-name">{user.name}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;