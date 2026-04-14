import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { hasRouteAccess } from "../utils/roles";

export default function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  // Not authenticated - redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // User is authenticated but trying to access a route they don't have permission for
  // Redirect to dashboard (first allowed route)
  if (!hasRouteAccess(user.role, location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
