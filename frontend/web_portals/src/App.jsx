import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import OrganiserLayout from './layouts/OrganiserLayout';
import ScanLayout from './layouts/ScanLayout';
import MerchantLayout from './layouts/MerchantLayout';

// Admin pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminOrganisers from './pages/admin/Organisers';
import AdminEvents from './pages/admin/Events';
import AdminCoupons from './pages/admin/Coupons';
import AdminRewardsConfig from './pages/admin/RewardsConfig';
import AdminRedemptions from './pages/admin/Redemptions';
import AdminQrCodes from './pages/admin/QRCodes';
import AdminPinVerify from './pages/admin/PinVerify';
import AdminMerchants from './pages/admin/Merchants';
import AdminCampaigns from './pages/admin/Campaigns';

// Organiser pages
import OrganiserDashboard from './pages/organiser/Dashboard';
import OrganiserEvents from './pages/organiser/Events';
import OrganiserEventCreate from './pages/organiser/EventCreate';
import OrganiserEventEdit from './pages/organiser/EventEdit';
import OrganiserRoster from './pages/organiser/Roster';
import OrganiserFeedback from './pages/organiser/Feedback';
import OrganiserQna from './pages/organiser/Qna';
import OrganiserOnsiteController from './pages/organiser/OnsiteController';

// Scan pages
import ScanLogin from './pages/scan/Login';
import EventSelect from './pages/scan/EventSelect';
import Scanner from './pages/scan/Scanner';
import Roster from './pages/scan/Roster';

// Merchant pages
import MerchantLogin from './pages/merchant/Login';
import PinVerify from './pages/merchant/PinVerify';
import History from './pages/merchant/History';

const router = createBrowserRouter([
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
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
