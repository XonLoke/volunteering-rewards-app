import { useToast } from './Toast';

export default function Topbar({ title, onMenuToggle }) {
  const { toast } = useToast();

  const handleLogout = () => {
    toast('Logged out successfully', 'info');
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
          <div className="topbar-avatar">A</div>
          <span>Admin</span>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
