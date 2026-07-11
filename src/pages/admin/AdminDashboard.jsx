import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStats } from '../../api/admin.js'
import { useToast } from '../../components/Toast.jsx'

/**
 * Admin dashboard — three stat cards (Total Users, Stores, Ratings).
 * Loading skeletons while fetching; error toast on failure.
 */

function StatCard({ label, value, icon, accent, loading }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            {loading ? (
              <div className="mt-2 h-8 w-16 animate-pulse rounded bg-slate-200" />
            ) : (
              <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
            )}
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${accent}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { showToast } = useToast()
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const { data } = await getStats()
        if (cancelled) return
        setStats(data)
      } catch (err) {
        if (cancelled) return
        const msg = err?.response?.data?.message || 'Failed to load statistics.'
        showToast(msg, 'error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [showToast])

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your StoreRate platform.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/users/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
            </svg>
            New User
          </Link>
          <Link
            to="/admin/stores/new"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
            </svg>
            New Store
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          loading={loading}
          accent="bg-blue-50 text-blue-600"
          icon={
            <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 116 0 3 3 0 01-6 0z" />
              <path d="M3 17a5 5 0 0110 0H3z" />
              <path d="M14 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
              <path d="M14 11a4 4 0 014 4h-4v-4z" />
            </svg>
          }
        />
        <StatCard
          label="Total Stores"
          value={stats.totalStores}
          loading={loading}
          accent="bg-emerald-50 text-emerald-600"
          icon={
            <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 2a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          }
        />
        <StatCard
          label="Total Ratings"
          value={stats.totalRatings}
          loading={loading}
          accent="bg-amber-50 text-amber-600"
          icon={
            <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.36 4.18a1 1 0 00.95.69h4.4c.97 0 1.37 1.24.59 1.81l-3.56 2.59a1 1 0 00-.36 1.12l1.36 4.18c.3.92-.76 1.69-1.54 1.12l-3.56-2.59a1 1 0 00-1.18 0l-3.56 2.59c-.78.57-1.84-.2-1.54-1.12l1.36-4.18a1 1 0 00-.36-1.12L2.7 9.61c-.78-.57-.38-1.81.59-1.81h4.4a1 1 0 00.95-.69l1.36-4.18z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Link
          to="/admin/users"
          className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 card-shadow transition hover:border-blue-300 hover:shadow-md"
        >
          <div>
            <h3 className="text-base font-semibold text-slate-900">Manage Users</h3>
            <p className="mt-1 text-sm text-slate-500">View, filter, and create user accounts.</p>
          </div>
          <svg className="h-5 w-5 text-slate-400 transition group-hover:text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.3 5.3a1 1 0 000 1.4L10.6 10l-3.3 3.3a1 1 0 001.4 1.4l4-4a1 1 0 000-1.4l-4-4a1 1 0 00-1.4 0z" clipRule="evenodd" />
          </svg>
        </Link>
        <Link
          to="/admin/stores"
          className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 card-shadow transition hover:border-blue-300 hover:shadow-md"
        >
          <div>
            <h3 className="text-base font-semibold text-slate-900">Manage Stores</h3>
            <p className="mt-1 text-sm text-slate-500">View, filter, and create stores.</p>
          </div>
          <svg className="h-5 w-5 text-slate-400 transition group-hover:text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.3 5.3a1 1 0 000 1.4L10.6 10l-3.3 3.3a1 1 0 001.4 1.4l4-4a1 1 0 000-1.4l-4-4a1 1 0 00-1.4 0z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
