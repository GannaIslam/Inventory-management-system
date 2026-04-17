import { useAuth } from "./useAuth";
import { hasPermission, hasRouteAccess } from "../utils/roles";

/**
 * Hook to check permissions and route access for the current user
 */
export function useRole() {
  const { user } = useAuth();

  const role = user?.role;

  return {
    role,
    // Check if user has access to a route
    canAccessRoute: (route) => hasRouteAccess(role, route),
    // Check if user has a specific permission
    hasPermission: (permissionKey) => hasPermission(role, permissionKey),
    // Convenience methods for common checks
    canViewReports: () => hasPermission(role, "canViewReports"),
    canManageProducts: () => hasPermission(role, "canManageProducts"),
    canManageSuppliers: () => hasPermission(role, "canManageSuppliers"),
    canManagePurchases: () => hasPermission(role, "canManagePurchases"),
    canProcessSales: () => hasPermission(role, "canProcessSales"),
    canManageInventory: () => hasPermission(role, "canManageInventory"),
    canTransferStock: () => hasPermission(role, "canTransferStock"),
    canModifyPrices: () => hasPermission(role, "canModifyPrices"),
  };
}
