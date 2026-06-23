import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import '../styles/admin.css';

const NAV_ITEMS = [
  {
    section: 'Overview',
    children: [
      { label: 'Dashboard', path: '/organiser', icon: 'D', exact: true },
    ],
  },
  {
    section: 'Events',
    children: [
      { label: 'My Events', path: '/organiser/events', icon: 'E' },
      { label: 'Create Event', path: '/organiser/event-create', icon: '+' },
    ],
  },
  {
    section: 'Event Tools',
    children: [
      { label: 'Roster', path: '/organiser/events', icon: 'R', exact: true },
      { label: 'Feedback', path: '/organiser/events', icon: 'F', exact: true },
      { label: 'Q&A', path: '/organiser/events', icon: 'Q', exact: true },
      { label: 'Onsite Controller', path: '/organiser/events', icon: 'O', exact: true },
    ],
  },
];

export default function OrganiserLayout() {
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
