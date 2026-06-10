import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import '../styles/admin.css';

const NAV_ITEMS = [
  {
    section: 'Overview',
    children: [
      { label: 'Dashboard', path: '/admin', icon: 'D', exact: true },
    ],
  },
  {
    section: 'Management',
    children: [
      { label: 'Users', path: '/admin/users', icon: 'U' },
      { label: 'Organisers', path: '/admin/organisers', icon: 'O' },
      { label: 'Events', path: '/admin/events', icon: 'E' },
      { label: 'Merchants', path: '/admin/merchants', icon: 'M' },
      { label: 'QR Codes', path: '/admin/qr-codes', icon: 'Q' },
    ],
  },
  {
    section: 'Rewards',
    children: [
      { label: 'Coupons', path: '/admin/coupons', icon: 'Cp' },
      { label: 'Rewards Config', path: '/admin/rewards-config', icon: 'R' },
      { label: 'Sponsorship Config', path: '/admin/sponsorship-config', icon: 'Sp' },
      { label: 'Redemptions', path: '/admin/redemptions', icon: 'Rd' },
    ],
  },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="admin-layout">
      <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <Sidebar items={NAV_ITEMS} />
        {sidebarOpen && (
          <div
            className="sidebar-backdrop"
            onClick={toggleSidebar}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'transparent',
              zIndex: -1,
            }}
          />
        )}
      </div>
      <Outlet context={{ sidebarOpen, toggleSidebar }} />
    </div>
  );
}
