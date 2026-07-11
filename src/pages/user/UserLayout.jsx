import { Outlet } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'

/**
 * User section layout.
 */
export default function UserLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
