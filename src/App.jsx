import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'

import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminCreateUser from './pages/admin/AdminCreateUser.jsx'
import AdminUserDetail from './pages/admin/AdminUserDetail.jsx'
import AdminStores from './pages/admin/AdminStores.jsx'
import AdminCreateStore from './pages/admin/AdminCreateStore.jsx'

import UserLayout from './pages/user/UserLayout.jsx'
import UserStores from './pages/user/UserStores.jsx'

import OwnerLayout from './pages/owner/OwnerLayout.jsx'
import OwnerDashboard from './pages/owner/OwnerDashboard.jsx'

import ChangePassword from './pages/shared/ChangePassword.jsx'

/**
 * Root route — sends authenticated users to their dashboard,
 * everyone else to /login.
 */
function RootRedirect() {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  const dest =
    user.role === 'admin'
      ? '/admin'
      : user.role === 'store_owner'
        ? '/owner'
        : '/user'
  return <Navigate to={dest} replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin section */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']} />
        }
      >
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/new" element={<AdminCreateUser />} />
          <Route path="users/:id" element={<AdminUserDetail />} />
          <Route path="stores" element={<AdminStores />} />
          <Route path="stores/new" element={<AdminCreateStore />} />
        </Route>
      </Route>

      {/* User section */}
      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRoles={['user']} />
        }
      >
        <Route element={<UserLayout />}>
          <Route index element={<UserStores />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>
      </Route>

      {/* Store owner section */}
      <Route
        path="/owner"
        element={
          <ProtectedRoute allowedRoles={['store_owner']} />
        }
      >
        <Route element={<OwnerLayout />}>
          <Route index element={<OwnerDashboard />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>
      </Route>

      {/* Catch-all → login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
