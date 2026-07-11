import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Top navigation bar shown on all authenticated pages.
 * - Brand / logo on the left.
 * - Role-specific nav links in the middle.
 * - User name, role badge, and logout on the right.
 * - Responsive: collapses to a hamburger menu on small screens.
 */

const ROLE_BADGE = {
  admin: 'bg-blue-100 text-blue-700',
  user: 'bg-emerald-100 text-emerald-700',
  store_owner: 'bg-amber-100 text-amber-700',
}

const ROLE_LABEL = {
  admin: 'Administrator',
  user: 'User',
  store_owner: 'Store Owner',
}

function NavLink({ to, label, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-sm font-medium transition ${
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {label}
    </Link>
  )
}

function navLinksForRole(role) {
  if (role === 'admin') {
    return [
      { to: '/admin', label: 'Dashboard' },
      { to: '/admin/users', label: 'Users' },
      { to: '/admin/stores', label: 'Stores' },
    ]
  }
  if (role === 'store_owner') {
    return [
      { to: '/owner', label: 'Dashboard' },
      { to: '/owner/change-password', label: 'Change Password' },
    ]
  }
  return [
    { to: '/user', label: 'Stores' },
    { to: '/user/change-password', label: 'Change Password' },
  ]
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  if (!user) return null

  const links = navLinksForRole(user.role)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const isActive = (to) =>
    to === '/admin' || to === '/user' || to === '/owner'
      ? location.pathname === to
      : location.pathname.startsWith(to)

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.36 4.18a1 1 0 00.95.69h4.4c.97 0 1.37 1.24.59 1.81l-3.56 2.59a1 1 0 00-.36 1.12l1.36 4.18c.3.92-.76 1.69-1.54 1.12l-3.56-2.59a1 1 0 00-1.18 0l-3.56 2.59c-.78.57-1.84-.2-1.54-1.12l1.36-4.18a1 1 0 00-.36-1.12L2.7 9.61c-.78-.57-.38-1.81.59-1.81h4.4a1 1 0 00.95-.69l1.36-4.18z" />
                </svg>
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Store<span className="text-blue-600">Rate</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex md:items-center md:gap-1">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} label={l.label} active={isActive(l.to)} />
              ))}
            </div>
          </div>

          {/* Right side (desktop) */}
          <div className="hidden md:flex md:items-center md:gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  ROLE_BADGE[user.role] || 'bg-slate-100 text-slate-700'
                }`}
              >
                {ROLE_LABEL[user.role] || user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h6.5A2.25 2.25 0 0114 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-6.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h6.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0111.75 18h-6.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M12.97 6.97a.75.75 0 011.06 0l2.5 2.5a.75.75 0 010 1.06l-2.5 2.5a.75.75 0 11-1.06-1.06l1.22-1.22H7.5a.75.75 0 010-1.5h6.69l-1.22-1.22a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
              Logout
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="space-y-1 px-4 py-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                label={l.label}
                active={isActive(l.to)}
                onClick={() => setOpen(false)}
              />
            ))}
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    ROLE_BADGE[user.role] || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {ROLE_LABEL[user.role] || user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
