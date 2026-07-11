import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getStores } from '../../api/admin.js'
import { useToast } from '../../components/Toast.jsx'
import Pagination from '../../components/Pagination.jsx'
import SortableHeader from '../../components/SortableHeader.jsx'
import StarRating from '../../components/StarRating.jsx'

/**
 * Admin → Stores list.
 * - Filters: name, email, address
 * - Sortable: name, email, rating (avg_rating)
 * - Pagination: 10 per page
 */

const LIMIT = 10

function SkeletonRow() {
  return (
    <tr className="border-t border-slate-100">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
        </td>
      ))}
    </tr>
  )
}

export default function AdminStores() {
  const { showToast } = useToast()

  const [filters, setFilters] = useState({ name: '', email: '', address: '' })
  const [applied, setApplied] = useState({ name: '', email: '', address: '' })

  const [sortBy, setSortBy] = useState('id')
  const [sortOrder, setSortOrder] = useState('asc')
  const [page, setPage] = useState(1)

  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: LIMIT, totalPages: 1 })
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = { ...applied, sortBy, sortOrder, page, limit: LIMIT }
      Object.keys(params).forEach((k) => {
        if (params[k] === '' || params[k] == null) delete params[k]
      })
      const { data: res } = await getStores(params)
      setData(res.data || [])
      setPagination(res.pagination || { total: 0, page, limit: LIMIT, totalPages: 1 })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load stores.'
      showToast(msg, 'error')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [applied, sortBy, sortOrder, page, showToast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSort = (field, order) => {
    setSortBy(field)
    setSortOrder(order)
    setPage(1)
  }

  const handleApplyFilters = (ev) => {
    ev.preventDefault()
    setApplied({ ...filters })
    setPage(1)
  }

  const handleResetFilters = () => {
    setFilters({ name: '', email: '', address: '' })
    setApplied({ name: '', email: '', address: '' })
    setPage(1)
  }

  const handleFilterChange = (field) => (ev) => {
    setFilters((f) => ({ ...f, [field]: ev.target.value }))
  }

  const inputBase =
    'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stores</h1>
          <p className="mt-1 text-sm text-slate-500">
            View, filter, and manage all stores.
          </p>
        </div>
        <Link
          to="/admin/stores/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
          </svg>
          New Store
        </Link>
      </div>

      {/* Filters */}
      <form
        onSubmit={handleApplyFilters}
        className="rounded-xl border border-slate-200 bg-white p-5 card-shadow"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Name</label>
            <input
              type="text"
              value={filters.name}
              onChange={handleFilterChange('name')}
              placeholder="Search by name"
              className={inputBase}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Email</label>
            <input
              type="text"
              value={filters.email}
              onChange={handleFilterChange('email')}
              placeholder="Search by email"
              className={inputBase}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Address</label>
            <input
              type="text"
              value={filters.address}
              onChange={handleFilterChange('address')}
              placeholder="Search by address"
              className={inputBase}
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white card-shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <SortableHeader label="Name" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Email" field="email" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Address
                </th>
                <SortableHeader label="Rating" field="avg_rating" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Ratings
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <svg className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm font-medium">No stores found</p>
                      <p className="text-xs">Try adjusting your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((s) => (
                  <tr key={s.id} className="transition hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                      {s.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{s.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="line-clamp-1 max-w-xs">{s.address}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <StarRating value={Number(s.avg_rating) || 0} readOnly size="sm" showValue />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {s.total_ratings ?? 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={setPage}
      />
    </div>
  )
}
