import { Navigate, Outlet } from "react-router-dom";
import { tokenStore } from "@/services/http";

/**
 * ProtectedRoute component
 * Protects routes that require authentication
 * Checks if user has a refresh token (access token may be expired, but we can refresh it)
 */
export function ProtectedRoute() {
  // Check if user has a refresh token (stored in localStorage)
  // Access token is in memory and may be expired, but we can refresh it
  const hasRefreshToken = !!tokenStore.getRefresh();

  if (!hasRefreshToken) {
    // No refresh token, redirect to login
    return <Navigate to="/login" replace />;
  }

  // User has refresh token, allow access
  // If access token is expired, the Axios interceptor will handle refresh
  return <Outlet />;
}


