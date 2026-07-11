import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getUsers } from '../../api/admin.js'
import { useToast } from '../../components/Toast.jsx'
import Pagination from '../../components/Pagination.jsx'
import SortableHeader from '../../components/SortableHeader.jsx'

/**
 * Admin → Users list.
 * - Filters: name, email, address, role (dropdown)
 * - Sortable: name, email
 * - Pagination: 10 per page
 * - Row links to user detail
 */

const ROLE_BADGE = {
  admin: 'bg-blue-100 text-blue-700',
  user: 'bg-emerald-100 text-emerald-700',
  store_owner: 'bg-amber-100 text-amber-700',
}

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

export default function AdminUsers() {
  const { showToast } = useToast()

  // Filters
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' })
  // Applied filters (committed on "Apply")
  const [applied, setApplied] = useState({ name: '', email: '', address: '', role: '' })

  // Sort + page
  const [sortBy, setSortBy] = useState('id')
  const [sortOrder, setSortOrder] = useState('asc')
  const [page, setPage] = useState(1)

  // Data
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: LIMIT, totalPages: 1 })
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        ...applied,
        sortBy,
        sortOrder,
        page,
        limit: LIMIT,
      }
      // Drop empty filter values
      Object.keys(params).forEach((k) => {
        if (params[k] === '' || params[k] == null) delete params[k]
      })
      const { data: res } = await getUsers(params)
      setData(res.data || [])
      setPagination(res.pagination || { total: 0, page, limit: LIMIT, totalPages: 1 })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load users.'
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
    setFilters({ name: '', email: '', address: '', role: '' })
    setApplied({ name: '', email: '', address: '', role: '' })
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
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="mt-1 text-sm text-slate-500">
            View, filter, and manage all user accounts.
          </p>
        </div>
        <Link
          to="/admin/users/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
          </svg>
          New User
        </Link>
      </div>

      {/* Filters */}
      <form
        onSubmit={handleApplyFilters}
        className="rounded-xl border border-slate-200 bg-white p-5 card-shadow"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Role</label>
            <select
              value={filters.role}
              onChange={handleFilterChange('role')}
              className={inputBase}
            >
              <option value="">All roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="store_owner">Store Owner</option>
            </select>
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
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
                        <path d="M9 6a3 3 0 116 0 3 3 0 01-6 0z" />
                        <path d="M3 17a5 5 0 0110 0H3z" />
                      </svg>
                      <p className="text-sm font-medium">No users found</p>
                      <p className="text-xs">Try adjusting your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((u) => (
                  <tr key={u.id} className="transition hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                      <Link to={`/admin/users/${u.id}`} className="hover:text-blue-600">
                        {u.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{u.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="line-clamp-1 max-w-xs">{u.address}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          ROLE_BADGE[u.role] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <Link
                        to={`/admin/users/${u.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        View
                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.3 5.3a1 1 0 000 1.4L10.6 10l-3.3 3.3a1 1 0 001.4 1.4l4-4a1 1 0 000-1.4l-4-4a1 1 0 00-1.4 0z" clipRule="evenodd" />
                        </svg>
                      </Link>
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
