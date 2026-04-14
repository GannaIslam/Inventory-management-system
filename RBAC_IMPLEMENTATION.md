# RBAC Implementation Documentation

## Overview

Role-Based Access Control (RBAC) has been successfully implemented across the inventory management system. The system now supports three distinct roles, each with specific permissions and route access.

---

## 🎯 Roles & Permissions

### 1. **Admin**

- **Full system access**
- Can access all routes and perform all operations
- Routes: Dashboard, Products, Categories, Warehouse (Locations & Stock), Purchasing (Suppliers, Invoices, Create), Sales (POS & Invoices), Reports
- Permissions: View Reports, Manage Products, Manage Suppliers, Create Purchases, Process Sales, Manage Inventory, Transfer Stock, Modify Prices

### 2. **Warehouse Manager**

- **Inventory management focused**
- Can view products and manage warehouse operations
- Routes: Dashboard, Products, Warehouse (Locations & Stock)
- Permissions: Manage Inventory, Transfer Stock
- Cannot: View Reports, Manage Products, Create Purchases, Process Sales, Modify Prices

### 3. **Cashier (POS)**

- **Sales focused**
- Can process customer transactions only
- Routes: Dashboard, Sales (POS Terminal)
- Permissions: Process Sales
- Cannot: View Reports, Manage Products, Create Purchases, Manage Inventory

---

## 🔐 Test Credentials

Login with these credentials to test each role:

| Role              | Username    | Password       |
| ----------------- | ----------- | -------------- |
| Admin             | `admin`     | `admin123`     |
| Warehouse Manager | `warehouse` | `warehouse123` |
| Cashier           | `cashier`   | `cashier123`   |

Credentials are displayed on the login page for convenience.

---

## 📁 Files Added/Modified

### **New Files Created:**

#### 1. `src/utils/roles.js`

Centralized RBAC configuration with:

- Role definitions (`ADMIN`, `WAREHOUSE_MANAGER`, `CASHIER`)
- Permission maps for each role
- Helper functions:
  - `hasRouteAccess(userRole, route)` - Check if user can access a route
  - `hasPermission(userRole, permissionKey)` - Check specific permission
  - `getAccessibleRoutes(userRole)` - Get all routes for a role

#### 2. `src/hooks/useRole.js`

React hook for permission checking in components:

```javascript
const { role, canAccessRoute, hasPermission, canViewReports, ... } = useRole()
```

Provides:

- `role` - Current user's role
- `canAccessRoute(route)` - Check route access
- `hasPermission(key)` - Check specific permission
- Convenience methods: `canViewReports()`, `canManageProducts()`, `canProcessSales()`, etc.

### **Files Modified:**

#### 1. `src/services/api.js` (Auth Service)

**Added:**

- Multiple test accounts (admin, warehouse, cashier)
- Each account has username, password, and role

**Example:**

```javascript
const testAccounts = {
  admin: {
    password: "admin123",
    user: { id: 1, name: "Pola Samy", username: "admin", role: "Admin" },
  },
  warehouse: {
    password: "warehouse123",
    user: {
      id: 2,
      name: "Ahmed Hassan",
      username: "warehouse",
      role: "Warehouse Manager",
    },
  },
  cashier: {
    password: "cashier123",
    user: { id: 3, name: "Fatima Ahmed", username: "cashier", role: "Cashier" },
  },
};
```

#### 2. `src/routes/ProtectedRoute.jsx` (Route Protection)

**Enhanced with:**

- Role-based route access checking
- Redirects unauthorized users to `/dashboard`
- Uses `hasRouteAccess()` from roles.js

**Logic:**

1. If not authenticated → redirect to `/login`
2. If authenticated but no route access → redirect to `/dashboard`
3. If authorized → allow route

#### 3. `src/components/layout/Sidebar.jsx` (Navigation Menu)

**Added:**

- Role-based menu filtering
- Only shows navigation items the user has access to
- Dynamically filters parent groups and child items
- Hides empty menu sections

**Example:**

- Admin sees all 6 menu items
- Warehouse Manager sees: Dashboard, Products, Warehouse
- Cashier sees: Dashboard, POS Sales

#### 4. `src/pages/LoginPage.jsx` (Login UI)

**Updated:**

- Shows demo credentials for all three roles
- Helps users test different role scenarios

---

## 🚀 How It Works

### 1. **Authentication Flow**

```
User Login → Validate Credentials → Set User with Role → Store in LocalStorage
```

### 2. **Route Protection Flow**

```
User Navigates → ProtectedRoute Checks → hasRouteAccess() → Allow or Redirect
```

### 3. **Navigation Filtering**

```
Component Mounts → useRole() Hook → Filter Menu Items → Show Only Allowed Items
```

### 4. **Permission Checking in Components**

```javascript
// Inside any page component
import { useRole } from "../hooks/useRole";

export default function MyPage() {
  const { canManageProducts, hasPermission } = useRole();

  if (!canManageProducts()) {
    return <div>You don't have permission</div>;
  }

  // Show restricted content
}
```

---

## 💡 Usage Examples

### Checking Route Access

```javascript
import { hasRouteAccess } from "../utils/roles";

const canAccess = hasRouteAccess("Admin", "/dashboard"); // true
const canAccess = hasRouteAccess("Cashier", "/purchasing/suppliers"); // false
```

### In React Components

```javascript
import { useRole } from "../hooks/useRole";

export default function ProductsPage() {
  const { canManageProducts, canModifyPrices, hasPermission } = useRole();

  return (
    <div>
      {canManageProducts() && <CreateProductButton />}
      {canModifyPrices() && <PriceModificationPanel />}
      {hasPermission("canManageInventory") && <InventoryTools />}
    </div>
  );
}
```

### Getting All Routes for a Role

```javascript
import { getAccessibleRoutes } from "../utils/roles";

const adminRoutes = getAccessibleRoutes("Admin");
const cashierRoutes = getAccessibleRoutes("Cashier");
```

---

## 🔧 Extending RBAC

### Add a New Permission

1. **Add to `ROLE_PERMISSIONS` in `src/utils/roles.js`:**

```javascript
[ROLES.ADMIN]: {
  routes: [...],
  canNewPermission: true,  // Add here
  ...
}
```

2. **Add convenience method in `src/hooks/useRole.js`:**

```javascript
canNewPermission: () => hasPermission(role, 'canNewPermission'),
```

3. **Use in components:**

```javascript
const { canNewPermission } = useRole();
```

### Add a New Role

1. **Add to `ROLES` in `src/utils/roles.js`:**

```javascript
export const ROLES = {
  ADMIN: "Admin",
  WAREHOUSE_MANAGER: "Warehouse Manager",
  CASHIER: "Cashier",
  MANAGER: "Manager", // New role
};
```

2. **Add permissions for new role in `ROLE_PERMISSIONS`:**

```javascript
[ROLES.MANAGER]: {
  routes: ['/dashboard', '/reports', '/purchasing/invoices'],
  canViewReports: true,
  canManagePurchases: true,
  // ... other permissions
}
```

3. **Add test account in `src/services/api.js`:**

```javascript
manager: {
  password: 'manager123',
  user: { id: 4, name: 'Manager Name', username: 'manager', role: 'Manager' }
}
```

---

## 📊 Route Access Matrix

| Route                 | Admin | Warehouse Manager | Cashier |
| --------------------- | :---: | :---------------: | :-----: |
| /dashboard            |   ✓   |         ✓         |    ✓    |
| /products             |   ✓   |         ✓         |    ✗    |
| /categories           |   ✓   |         ✗         |    ✗    |
| /warehouse/locations  |   ✓   |         ✓         |    ✗    |
| /warehouse/stock      |   ✓   |         ✓         |    ✗    |
| /purchasing/suppliers |   ✓   |         ✗         |    ✗    |
| /purchasing/invoices  |   ✓   |         ✗         |    ✗    |
| /purchasing/create    |   ✓   |         ✗         |    ✗    |
| /sales/pos            |   ✓   |         ✗         |    ✓    |
| /sales/invoices       |   ✓   |         ✗         |    ✗    |
| /reports              |   ✓   |         ✗         |    ✗    |

---

## ✅ Implementation Checklist

- ✅ Role definitions created
- ✅ Route access control implemented
- ✅ Role filtering in navigation sidebar
- ✅ Test credentials for all roles
- ✅ Build succeeds without errors
- ✅ No UI/styling changes (design preserved)
- ✅ Reusable hooks and utilities
- ✅ Documentation provided

---

## 🧪 Testing the RBAC

1. **As Admin**
   - Login with `admin` / `admin123`
   - See all menu items
   - Access all pages without restriction
   - View Reports option available

2. **As Warehouse Manager**
   - Login with `warehouse` / `warehouse123`
   - See only: Dashboard, Products, Warehouse items
   - Purchasing and POS Sales hidden
   - Try accessing `/purchasing/suppliers` → redirects to `/dashboard`

3. **As Cashier**
   - Login with `cashier` / `cashier123`
   - See only: Dashboard, POS Sales
   - All other menu items hidden
   - Try accessing `/products` → redirects to `/dashboard`

---

## 📝 Summary

The RBAC system is now fully integrated with:

- ✅ Three distinct roles with clear permissions
- ✅ Route-level access control
- ✅ Dynamic menu filtering
- ✅ Reusable permission checking hooks
- ✅ Clean, maintainable code structure
- ✅ No changes to UI/design
- ✅ Easy to extend for new roles/permissions
