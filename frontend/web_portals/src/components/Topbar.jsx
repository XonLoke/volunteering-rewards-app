import { useNavigate } from 'react-router-dom';
import { useToast } from './Toast';
import { apiLogout } from '../services/api';

export default function Topbar({ title, onMenuToggle }) {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Detect which portal we're on from the URL
  const path = window.location.pathname;
  let loginPath = '/admin/login';
  let userLabel = 'Admin';
  if (path.startsWith('/organiser')) {
    loginPath = '/organiser/login';
    userLabel = 'Organiser';
  } else if (path.startsWith('/merchant')) {
    loginPath = '/merchant/login';
    userLabel = 'Merchant';
  } else if (path.startsWith('/scan')) {
    loginPath = '/scan/login';
    userLabel = 'Scanner';
  }

  const handleLogout = () => {
    apiLogout();
    toast('Logged out successfully', 'info');
    navigate(loginPath);
  };

  return (
    <header className="topbar">
      <button className="menu-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-right">
        <div className="topbar-user">
          <div className="topbar-avatar">{userLabel[0]}</div>
          <span>{userLabel}</span>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
