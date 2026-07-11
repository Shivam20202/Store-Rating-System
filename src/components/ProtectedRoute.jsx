import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Route guard.
 * - If not authenticated → redirect to /login (remembering where we came from).
 * - If authenticated but role not allowed → redirect to that user's dashboard.
 * - Otherwise render the children, or <Outlet /> when used as a layout wrapper.
 *
 * `allowedRoles` is an array of roles permitted to view the route.
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // Wait for localStorage hydration before deciding — otherwise a page
  // refresh would log the user out before the context rehydrates.
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  // Not logged in at all.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Logged in but wrong role → send them to their own dashboard.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dest =
      user.role === 'admin'
        ? '/admin'
        : user.role === 'store_owner'
          ? '/owner'
          : '/user'
    return <Navigate to={dest} replace />
  }

  // Render nested routes if no explicit children, otherwise the children.
  return children ? <>{children}</> : <Outlet />
}
