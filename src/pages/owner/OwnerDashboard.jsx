import { useEffect, useState, useMemo } from 'react'
import { getOwnerDashboard } from '../../api/owner.js'
import { useToast } from '../../components/Toast.jsx'
import StarRating from '../../components/StarRating.jsx'
import SortableHeader from '../../components/SortableHeader.jsx'

/**
 * Store owner → Dashboard.
 * - Store info card with average rating (stars)
 * - Table of users who rated the store: Name, Email, Rating, Date
 * - Sortable by name and rating (client-side, since the API returns all raters)
 */

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function OwnerDashboard() {
  const { showToast } = useToast()
  const [store, setStore] = useState(null)
  const [raters, setRaters] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('updated_at')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const { data } = await getOwnerDashboard()
        if (cancelled) return
        setStore(data.store || null)
        setRaters(data.raters || [])
      } catch (err) {
        if (cancelled) return
        const msg = err?.response?.data?.message || 'Failed to load dashboard.'
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

  // Client-side sorting of the raters list.
  const sortedRaters = useMemo(() => {
    const arr = [...raters]
    const dir = sortOrder === 'asc' ? 1 : -1
    arr.sort((a, b) => {
      let av, bv
      if (sortBy === 'name') {
        av = (a.user_name || '').toLowerCase()
        bv = (b.user_name || '').toLowerCase()
        return av < bv ? -dir : av > bv ? dir : 0
      }
      if (sortBy === 'rating') {
        av = Number(a.rating)
        bv = Number(b.rating)
        return (av - bv) * dir
      }
      // default: updated_at
      av = new Date(a.updated_at || a.created_at).getTime() || 0
      bv = new Date(b.updated_at || b.created_at).getTime() || 0
      return (av - bv) * dir
    })
    return arr
  }, [raters, sortBy, sortOrder])

  const handleSort = (field, order) => {
    setSortBy(field)
    setSortOrder(order)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-40 w-full animate-pulse rounded-xl bg-slate-100" />
        <div className="h-64 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    )
  }

  if (!store) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center card-shadow">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <svg className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium text-slate-600">No store found</p>
          <p className="text-xs">You don’t have a store associated with your account yet.</p>
        </div>
      </div>
    )
  }

  const avg = Number(store.avg_rating) || 0
  const total = store.total_ratings || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Owner dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your store details and customer ratings.
        </p>
      </div>

      {/* Store info card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                Store
              </span>
              <h2 className="text-xl font-bold text-slate-900">{store.name}</h2>
            </div>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{store.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Address</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{store.address}</dd>
              </div>
            </dl>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-slate-50 p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Average rating</p>
            <div className="mt-2 flex items-center gap-2">
              <StarRating value={avg} readOnly size="lg" />
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-900">{avg.toFixed(1)}</p>
            <p className="mt-1 text-sm text-slate-500">
              {total} rating{total === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      </div>

      {/* Raters table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Customer ratings</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Users who have rated your store.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <SortableHeader label="Name" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Email
                </th>
                <SortableHeader label="Rating" field="rating" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Date" field="updated_at" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sortedRaters.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <svg className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.36 4.18a1 1 0 00.95.69h4.4c.97 0 1.37 1.24.59 1.81l-3.56 2.59a1 1 0 00-.36 1.12l1.36 4.18c.3.92-.76 1.69-1.54 1.12l-3.56-2.59a1 1 0 00-1.18 0l-3.56 2.59c-.78.57-1.84-.2-1.54-1.12l1.36-4.18a1 1 0 00-.36-1.12L2.7 9.61c-.78-.57-.38-1.81.59-1.81h4.4a1 1 0 00.95-.69l1.36-4.18z" />
                      </svg>
                      <p className="text-sm font-medium">No ratings yet</p>
                      <p className="text-xs">Customer ratings will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedRaters.map((r) => (
                  <tr key={r.id} className="transition hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                      {r.user_name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {r.user_email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <StarRating value={Number(r.rating)} readOnly size="sm" showValue />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {formatDate(r.updated_at || r.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
