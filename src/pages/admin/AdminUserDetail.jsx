import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getUserById } from '../../api/admin.js'
import { useToast } from '../../components/Toast.jsx'
import StarRating from '../../components/StarRating.jsx'

/**
 * Admin → User detail.
 * Shows the user's basic info. If the user is a store_owner, also shows
 * their store and its average rating.
 */

const ROLE_BADGE = {
  admin: 'bg-blue-100 text-blue-700',
  user: 'bg-emerald-100 text-emerald-700',
  store_owner: 'bg-amber-100 text-amber-700',
}

function Field({ label, value }) {
  return (
    <div className="border-b border-slate-100 py-4 last:border-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value || '—'}</dd>
    </div>
  )
}

export default function AdminUserDetail() {
  const { id } = useParams()
  const { showToast } = useToast()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const { data } = await getUserById(id)
        if (cancelled) return
        setUser(data.data)
      } catch (err) {
        if (cancelled) return
        const msg = err?.response?.data?.message || 'Failed to load user.'
        showToast(msg, 'error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [id, showToast])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />
        <div className="rounded-xl border border-slate-200 bg-white p-6 card-shadow">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-full animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center card-shadow">
        <p className="text-sm font-medium text-slate-500">User not found.</p>
        <Link to="/admin/users" className="mt-3 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700">
          ← Back to users
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin/users" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.7 5.3a1 1 0 010 1.4L9.4 10l3.3 3.3a1 1 0 01-1.4 1.4l-4-4a1 1 0 010-1.4l4-4a1 1 0 011.4 0z" clipRule="evenodd" />
          </svg>
          Back to users
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{user.name}</h1>
        <p className="mt-1 text-sm text-slate-500">User details and store information.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User info */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">Profile</h2>
          </div>
          <dl className="px-6">
            <Field label="Name" value={user.name} />
            <Field label="Email" value={user.email} />
            <Field label="Address" value={user.address} />
            <div className="py-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Role</dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    ROLE_BADGE[user.role] || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {user.role}
                </span>
              </dd>
            </div>
            <Field
              label="Joined"
              value={user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
            />
          </dl>
        </div>

        {/* Store info (store_owner only) */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">Store</h2>
          </div>
          <div className="px-6 py-4">
            {user.role === 'store_owner' && user.store ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Store name</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{user.store.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</p>
                  <p className="mt-1 text-sm text-slate-600">{user.store.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Address</p>
                  <p className="mt-1 text-sm text-slate-600">{user.store.address}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Average rating</p>
                  <div className="mt-1 flex items-center gap-2">
                    <StarRating value={Number(user.store.avg_rating) || 0} readOnly size="md" />
                    <span className="text-sm font-semibold text-slate-900">
                      {Number(user.store.avg_rating).toFixed(1)}
                    </span>
                    <span className="text-sm text-slate-500">
                      ({user.store.total_ratings} rating{user.store.total_ratings === 1 ? '' : 's'})
                    </span>
                  </div>
                </div>
              </div>
            ) : user.role === 'store_owner' ? (
              <p className="py-6 text-center text-sm text-slate-500">
                This store owner does not have a store assigned.
              </p>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                Store information is only shown for store owners.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
