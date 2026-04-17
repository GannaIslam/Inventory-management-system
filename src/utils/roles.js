// Role-Based Access Control Configuration

export const ROLES = {
  ADMIN: "Admin",
  WAREHOUSE_MANAGER: "Warehouse Manager",
  CASHIER: "Cashier",
};

// Define permissions for each role
// Each role has access to specific routes
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    routes: [
      "/dashboard",
      "/products",
      "/categories",
      "/warehouse/locations",
      "/warehouse/stock",
      "/purchasing/suppliers",
      "/purchasing/invoices",
      "/purchasing/create",
      "/sales/pos",
      "/sales/invoices",
      "/reports",
    ],
    canViewReports: true,
    canManageProducts: true,
    canManageSuppliers: true,
    canManagePurchases: true,
    canProcessSales: true,
    canManageInventory: true,
    canTransferStock: true,
    canModifyPrices: true,
  },
  [ROLES.WAREHOUSE_MANAGER]: {
    routes: [
      "/dashboard",
      "/products",
      "/warehouse/locations",
      "/warehouse/stock",
    ],
    canViewReports: false,
    canManageProducts: false,
    canManageSuppliers: false,
    canManagePurchases: false,
    canProcessSales: false,
    canManageInventory: true,
    canTransferStock: true,
    canModifyPrices: false,
  },
  [ROLES.CASHIER]: {
    routes: ["/dashboard", "/sales/pos"],
    canViewReports: false,
    canManageProducts: false,
    canManageSuppliers: false,
    canManagePurchases: false,
    canProcessSales: true,
    canManageInventory: false,
    canTransferStock: false,
    canModifyPrices: false,
  },
};

/**
 * Check if user has permission to access a route
 */
export const hasRouteAccess = (userRole, route) => {
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;
  return permissions.routes.includes(route);
};

/**
 * Check if user has a specific permission
 */
export const hasPermission = (userRole, permissionKey) => {
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;
  return permissions[permissionKey] === true;
};

/**
 * Get all routes accessible by a role
 */
export const getAccessibleRoutes = (userRole) => {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions?.routes || [];
};
