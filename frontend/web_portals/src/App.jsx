import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import OrganiserLayout from './layouts/OrganiserLayout';
import ScanLayout from './layouts/ScanLayout';
import MerchantLayout from './layouts/MerchantLayout';

import ScanLogin from './pages/scan/Login';
import EventSelect from './pages/scan/EventSelect';
import Scanner from './pages/scan/Scanner';
import Roster from './pages/scan/Roster';

import MerchantLogin from './pages/merchant/Login';
import PinVerify from './pages/merchant/PinVerify';
import History from './pages/merchant/History';

function Placeholder({ title }) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p className="muted">This page is under construction.</p>
    </div>
  );
}

function AdminDashboard() { return <Placeholder title="Admin Dashboard" />; }
function AdminUsers() { return <Placeholder title="Users Management" />; }
function AdminOrganisers() { return <Placeholder title="Organisers Management" />; }
function AdminEvents() { return <Placeholder title="Events Management" />; }
function AdminCoupons() { return <Placeholder title="Coupons Management" />; }
function AdminRewardsConfig() { return <Placeholder title="Rewards Configuration" />; }
function AdminRedemptions() { return <Placeholder title="Redemptions" />; }
function AdminQrCodes() { return <Placeholder title="QR Codes" />; }
function AdminPinVerify() { return <Placeholder title="PIN Verification" />; }
function AdminMerchants() { return <Placeholder title="Merchants" />; }
function AdminCampaigns() { return <Placeholder title="Campaigns" />; }

function OrganiserDashboard() { return <Placeholder title="Organiser Dashboard" />; }
function OrganiserEvents() { return <Placeholder title="My Events" />; }
function OrganiserEventCreate() { return <Placeholder title="Create Event" />; }
function OrganiserEventEdit() { return <Placeholder title="Edit Event" />; }
function OrganiserRoster() { return <Placeholder title="Event Roster" />; }
function OrganiserFeedback() { return <Placeholder title="Event Feedback" />; }
function OrganiserQna() { return <Placeholder title="Q&A" />; }
function OrganiserOnsiteController() { return <Placeholder title="Onsite Controller" />; }

const router = createBrowserRouter([
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'organisers', element: <AdminOrganisers /> },
      { path: 'events', element: <AdminEvents /> },
      { path: 'coupons', element: <AdminCoupons /> },
      { path: 'rewards-config', element: <AdminRewardsConfig /> },
      { path: 'redemptions', element: <AdminRedemptions /> },
      { path: 'qr-codes', element: <AdminQrCodes /> },
      { path: 'pin-verify', element: <AdminPinVerify /> },
      { path: 'merchants', element: <AdminMerchants /> },
      { path: 'campaigns', element: <AdminCampaigns /> },
    ],
  },
  {
    path: '/organiser',
    element: <OrganiserLayout />,
    children: [
      { index: true, element: <OrganiserDashboard /> },
      { path: 'events', element: <OrganiserEvents /> },
      { path: 'event-create', element: <OrganiserEventCreate /> },
      { path: 'event-edit/:id', element: <OrganiserEventEdit /> },
      { path: 'roster/:id', element: <OrganiserRoster /> },
      { path: 'feedback/:id', element: <OrganiserFeedback /> },
      { path: 'qna/:id', element: <OrganiserQna /> },
      { path: 'onsite-controller/:id', element: <OrganiserOnsiteController /> },
    ],
  },
  {
    path: '/scan',
    element: <ScanLayout />,
    children: [
      { index: true, element: <ScanLogin /> },
      { path: 'events', element: <EventSelect /> },
      { path: 'scanner/:eventId', element: <Scanner /> },
      { path: 'roster/:eventId', element: <Roster /> },
    ],
  },
  {
    path: '/merchant',
    element: <MerchantLayout />,
    children: [
      { index: true, element: <MerchantLogin /> },
      { path: 'verify', element: <PinVerify /> },
      { path: 'history', element: <History /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/admin" replace />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
