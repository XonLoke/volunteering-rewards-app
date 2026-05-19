import { Outlet } from 'react-router-dom';
import '../styles/admin.css';

export default function ScanLayout() {
  return (
    <div className="admin-layout">
      <main className="main-content" style={{ marginLeft: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
