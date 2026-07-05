import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import '../styles/admin.css';

const MERCHANT_NAV = [
  {
    section: 'Overview',
    children: [
      { label: 'Dashboard', path: '/merchant/dashboard', icon: 'D', exact: true },
    ],
  },
  {
    section: 'Operations',
    children: [
      { label: 'Verify PIN', path: '/merchant/verify', icon: '✓' },
      { label: 'History', path: '/merchant/history', icon: 'H' },
    ],
  },
  {
    section: 'Products',
    children: [
      { label: 'My Products', path: '/merchant/products', icon: 'P' },
    ],
  },
];

export default function MerchantLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="admin-layout">
      <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <Sidebar items={MERCHANT_NAV} brand="Cashier Portal" />
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
