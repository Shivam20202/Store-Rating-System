import { Outlet } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'

/**
 * Admin section layout.
 * Navbar on top, content area below with a max-width container.
 */
export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
