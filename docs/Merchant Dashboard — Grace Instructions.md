# Merchant Dashboard — Step-by-Step Instructions for Grace

> **Assigned to:** Grace  
> **Due:** Sprint 5 (Jul 6, 2026)  
> **Goal:** Expand the Merchant/Cashier portal with a dashboard, product management, and redemption records.  
> **Style:** Must match the Admin Portal and Organiser Portal design patterns.

---

## What Needs to Be Built

The merchant portal currently has 3 basic pages (Login, PIN Verify, History). Andy wants it expanded into a full dashboard with:

1. **Dashboard page** — Stats cards, popular items, recent activity  
2. **Products page** — CRUD management for merchant products  
3. **Redesigned layout** — Sidebar navigation (like Admin/Organiser portals)  
4. **Login redirect** — Go to dashboard after login instead of PIN verify

---

## Step 1: Backend — Add New API Endpoints

### Files to modify:

**`backend/src/services/merchant.service.js`**

Add these new functions (at the end, before `module.exports`):

| Function | Purpose |
|----------|---------|
| `getDashboardStats(userId)` | Returns today's redemptions, total value, active products count, popular items, recent activity |
| `listProducts(userId)` | Returns merchant's products |
| `createProduct(userId, data)` | Creates a new product (name, description, points_cost) |
| `updateProduct(userId, productId, data)` | Updates an existing product |
| `deleteProduct(userId, productId)` | Soft-deletes (deactivates) a product |
| `listRedemptions(userId, query)` | Returns filtered redemption records |

**Key detail:** The merchant user is identified by `req.user.id` (from JWT). To find their merchant business record, look up the user's email from `users` table, then find the merchant by `contact_email` in the `merchants` table.

**`backend/src/controllers/merchant.controller.js`**

Add handler functions for each new endpoint. Keep the same pattern as the existing handlers (try/catch, call service, res.json).

**`backend/src/routes/merchant.routes.js`**

Add these routes (all guarded by `authenticate` + `authorize("merchant", "admin")`):

```
GET    /api/merchant/dashboard        → dashboard stats
GET    /api/merchant/products         → list products
POST   /api/merchant/products         → create product
PUT    /api/merchant/products/:id     → update product
DELETE /api/merchant/products/:id     → delete product (soft)
GET    /api/merchant/redemptions      → filtered redemption records
```

---

## Step 2: Frontend — Redesign Merchant Layout

### 2.1 Update `App.jsx`

Import the new page components:
```jsx
import MerchantDashboard from './pages/merchant/Dashboard';
import MerchantProducts from './pages/merchant/Products';
```

Restructure merchant routes so login is **outside** the layout (standalone page), matching the admin pattern:

```jsx
{
  path: '/merchant/login',
  element: <MerchantLogin />,
},
{
  path: '/merchant',
  element: <MerchantLayout />,
  children: [
    { index: true, element: <Navigate to="/merchant/dashboard" replace /> },
    { path: 'dashboard', element: <MerchantDashboard /> },
    { path: 'verify', element: <PinVerify /> },
    { path: 'history', element: <History /> },
    { path: 'products', element: <MerchantProducts /> },
  ],
},
```

### 2.2 Update `MerchantLayout.jsx`

Replace the current minimal wrapper with a sidebar-based layout (copy the AdminLayout pattern):

```jsx
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
          <div className="sidebar-backdrop" onClick={toggleSidebar} />
        )}
      </div>
      <Outlet context={{ sidebarOpen, toggleSidebar }} />
    </div>
  );
}
```

### 2.3 Update `Login.jsx`

Change the redirect target after successful login:

```jsx
// Before:
navigate('/merchant/verify');

// After:
navigate('/merchant/dashboard');
```

---

## Step 3: Create Dashboard Page

### New file: `frontend/web_portals/src/pages/merchant/Dashboard.jsx`

Style rules (must match Admin Portal):
- Use `className="main-content"` wrapper
- Use `<Topbar title="Dashboard" />` at top
- Use `stats-grid` / `stat-card` / `stat-value` / `stat-label` CSS classes for stats
- Use `card` / `card-header` / `card-title` for content sections
- Handle all states: **loading**, **error** (with retry button), **empty** (no data), and **normal**

**Stat cards** to display (call `GET /api/merchant/dashboard`):
| Stat | Source |
|------|--------|
| Today's Redemptions | `stats.today_redemptions` |
| Today's Value ($) | `stats.today_value_cents` (convert cents to dollars) |
| Active Products | `stats.active_products` |
| Total All Time | `stats.total_redemptions` |

**Sections** below the stats:

1. **Quick Actions** — buttons linking to: Verify PIN, Manage Products, View History
2. **Most Popular Items** — list with redemption counts (use `stats.popular_items`)
3. **Recent Redemptions** — list with coupon title, volunteer name, value, time (use `stats.recent_activity`)

---

## Step 4: Create Products CRUD Page

### New file: `frontend/web_portals/src/pages/merchant/Products.jsx`

Style rules:
- Same layout structure as admin `Coupons.jsx`:
  - `main-content` → `Topbar` → `page-header` (title + "+ Add Product" button) → `DataTable` → Modals
- Use existing shared components: `DataTable`, `Modal`, `Topbar`, `useToast`
- Use existing CSS classes: `form-group`, `form-label`, `form-input`, `btn btn-primary`, `btn btn-secondary`, `btn btn-danger`, `modal-actions`, `status-badge`

**Columns** for DataTable:
| Column | Data field | Notes |
|--------|-----------|-------|
| Name | `name` | Bold text |
| Description | `description` | Text or "-" if empty |
| Points | `points_cost` | Orange color, show as "N pts" |
| Status | `is_active` | Status badge: "Active" or "Inactive" |
| Actions | — | Edit + Deactivate buttons |

**Modals:**
| Modal | Trigger | Fields |
|-------|---------|-------|
| Add Product | Click "+ Add Product" | Name*, Description, Points Cost |
| Edit Product | Click "Edit" | Same fields, pre-filled |
| Deactivate | Click "Deactivate" | Confirmation message |

---

## Step 5: Fix PinVerify and History to Work with Sidebar

**⚠️ Important issue:** The existing `PinVerify.jsx` and `History.jsx` use full-page inline styles (`styles.wrapper`, `styles.container`) and have their own logout button. When rendered inside the sidebar layout, they will:

1. Have their own logout button **plus** the Topbar's logout (duplicate)
2. Their wrapper styles may overlap with the sidebar

**Fix for PinVerify.jsx:**
- Remove the `styles.wrapper` full-page wrapper
- Use `className="main-content"` and `<Topbar title="Verify PIN" />` instead
- Remove the inline logout button (Topbar handles it)
- Adjust the content to sit within the main-content area

**Fix for History.jsx:**
- Same approach — use `main-content` + `Topbar` pattern
- Remove inline wrapper and logout button
- Keep the filter tabs, table, and pagination (they work fine)

---

## Step 6: Verify Everything Works

Test with the **cheryl@test.com / password123** merchant account:

| Test | Expected |
|------|----------|
| Login | Redirects to `/merchant/dashboard` (not `/merchant/verify`) |
| Dashboard | Shows 4 stat cards, quick action buttons, popular items (if any), recent redemptions |
| Products | Empty state → create a product → appears in list → edit it → deactivate it |
| Verify PIN | Still works from sidebar nav |
| History | Still works, shows redemption records |
| Empty dashboard | If no redemptions, shows "No redemptions yet" message |
| Error state | If backend is down, shows error message with retry button |
| Mobile responsive | Sidebar collapses on small screens, content is readable |

---

## Reference: Existing Admin Portal Patterns

| Pattern | File Example | Key Classes |
|---------|-------------|-------------|
| **Layout** | `layouts/AdminLayout.jsx` | `admin-layout`, `sidebar`, `sidebar open` |
| **Dashboard** | `pages/admin/Dashboard.jsx` | `main-content`, `stats-grid`, `stat-card`, `stat-value`, `stat-label`, `card`, `card-header`, `card-title` |
| **CRUD List** | `pages/admin/Coupons.jsx` | `page-header`, `btn btn-primary`, `DataTable` |
| **Form Modal** | `pages/admin/Coupons.jsx` (CouponFormModal) | `form-group`, `form-label`, `form-input`, `modal-actions`, `btn btn-secondary`, `btn btn-primary` |
| **Delete** | `pages/admin/Coupons.jsx` (DeleteConfirmModal) | `modal-actions`, `btn btn-danger`, `btn btn-secondary` |
| **Status** | `components/StatusBadge.jsx` | `status-badge`, `status-badge approved`, `status-badge disabled` |
| **API** | `services/api.js` | `apiGet()`, `apiPost()`, `apiPut()`, `apiDel()` |

---

## Quick Checklist

- [ ] Backend: Add service functions (dashboard stats, product CRUD, redemptions)
- [ ] Backend: Add controller handlers
- [ ] Backend: Add routes
- [ ] Frontend: Update `App.jsx` routing
- [ ] Frontend: Redesign `MerchantLayout.jsx` with sidebar
- [ ] Frontend: Update `Login.jsx` redirect
- [ ] Frontend: Create `Dashboard.jsx` page
- [ ] Frontend: Create `Products.jsx` page
- [ ] Frontend: Fix `PinVerify.jsx` for sidebar layout
- [ ] Frontend: Fix `History.jsx` for sidebar layout
- [ ] Test all states: loading, error, empty, normal
- [ ] Verify mobile responsiveness
