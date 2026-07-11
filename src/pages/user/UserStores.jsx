import { useEffect, useState, useCallback } from 'react'
import { getUserStores, submitRating, updateRating } from '../../api/user.js'
import { useToast } from '../../components/Toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import Pagination from '../../components/Pagination.jsx'
import StarRating from '../../components/StarRating.jsx'


const LIMIT = 10

function StoreCard({ store, onRate }) {
  const userRating = store.user_rating ?? null
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 card-shadow transition hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-900">{store.name}</h3>
          <p className="mt-0.5 truncate text-sm text-slate-500">{store.email}</p>
        </div>
        <span className="flex-shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          #{store.id}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{store.address}</p>

      <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Overall</span>
          <StarRating value={Number(store.avg_rating) || 0} readOnly size="sm" showValue total={store.total_ratings} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Your rating</span>
          {userRating != null ? (
            <StarRating value={Number(userRating)} readOnly size="sm" />
          ) : (
            <span className="text-sm text-slate-400">Not rated yet</span>
          )}
        </div>
      </div>

      <button
        onClick={() => onRate(store)}
        className="mt-4 cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.36 4.18a1 1 0 00.95.69h4.4c.97 0 1.37 1.24.59 1.81l-3.56 2.59a1 1 0 00-.36 1.12l1.36 4.18c.3.92-.76 1.69-1.54 1.12l-3.56-2.59a1 1 0 00-1.18 0l-3.56 2.59c-.78.57-1.84-.2-1.54-1.12l1.36-4.18a1 1 0 00-.36-1.12L2.7 9.61c-.78-.57-.38-1.81.59-1.81h4.4a1 1 0 00.95-.69l1.36-4.18z" />
        </svg>
        {userRating != null ? 'Update rating' : 'Rate this store'}
      </button>
    </div>
  )
}

function RatingModal({ store, initialRating, onClose, onSubmit }) {
  const [rating, setRating] = useState(initialRating || 0)
  const [submitting, setSubmitting] = useState(false)
  const isUpdate = initialRating != null

  const handleSubmit = async () => {
    if (!rating) return
    setSubmitting(true)
    await onSubmit(store.id, rating, isUpdate)
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 animate-fade-in"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 card-shadow animate-fade-in-up">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isUpdate ? 'Update your rating' : 'Rate this store'}
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">{store.name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <StarRating value={rating} onChange={setRating} size="lg" />
          <p className="text-sm text-slate-500">
            {rating ? `You selected ${rating} star${rating === 1 ? '' : 's'}` : 'Click a star to rate (1–5)'}
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!rating || submitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {submitting ? 'Saving…' : isUpdate ? 'Update rating' : 'Submit rating'}
          </button>
          <button
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function StoreSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 card-shadow">
      <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
      <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-100" />
      <div className="mt-4 h-10 w-full animate-pulse rounded bg-slate-100" />
    </div>
  )
}

export default function UserStores() {
  const { showToast } = useToast()
  const { user } = useAuth()

  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [sortBy, setSortBy] = useState('id')
  const [sortOrder, setSortOrder] = useState('asc')
  const [page, setPage] = useState(1)

  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: LIMIT, totalPages: 1 })
  const [loading, setLoading] = useState(true)

  // Rating modal state
  const [modalStore, setModalStore] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = { sortBy, sortOrder, page, limit: LIMIT }
      if (appliedSearch.trim()) {
        params.search = appliedSearch.trim()
      }
      const { data: res } = await getUserStores(params)
      setData(res.data || [])
      setPagination(res.pagination || { total: 0, page, limit: LIMIT, totalPages: 1 })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load stores.'
      showToast(msg, 'error')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [appliedSearch, sortBy, sortOrder, page, showToast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearch = (ev) => {
    ev.preventDefault()
    setAppliedSearch(search)
    setPage(1)
  }

  const handleClearSearch = () => {
    setSearch('')
    setAppliedSearch('')
    setPage(1)
  }

  const handleSortChange = (ev) => {
    const [field, order] = ev.target.value.split(':')
    setSortBy(field)
    setSortOrder(order || 'asc')
    setPage(1)
  }

  const openRatingModal = (store) => {
    setModalStore(store)
  }

  const closeRatingModal = () => {
    setModalStore(null)
  }

  const handleRatingSubmit = async (storeId, rating, isUpdate) => {
    try {
      if (isUpdate) {
        await updateRating(storeId, { rating })
        showToast('Rating updated successfully.', 'success')
      } else {
        await submitRating({ storeId, rating })
        showToast('Rating submitted successfully.', 'success')
      }
      // Refresh the list so the card reflects the new rating.
      setModalStore(null)
      fetchData()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save rating.'
      showToast(msg, 'error')
    }
  }

  const sortValue = `${sortBy}:${sortOrder}`
  const inputBase =
    'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Browse stores</h1>
        <p className="mt-1 text-sm text-slate-500">
          Search for stores by name or address, then rate them.
        </p>
      </div>

      {/* Search + sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.48l3.82 3.82a1 1 0 01-1.42 1.42l-3.82-3.82A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(ev) => setSearch(ev.target.value)}
              placeholder="Search by name or address…"
              className={`${inputBase} pl-9`}
            />
            {appliedSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            )}
          </div>
          <button
            type="submit"
            className="rounded-md cursor-pointer bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Search
          </button>
        </form>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm font-medium text-slate-500">Sort:</label>
          <select
            id="sort"
            value={sortValue}
            onChange={handleSortChange}
            className={`${inputBase} w-44`}
          >
            <option value="name:asc">Name (A–Z)</option>
            <option value="name:desc">Name (Z–A)</option>
            <option value="avg_rating:desc">Rating (High→Low)</option>
            <option value="avg_rating:asc">Rating (Low→High)</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <StoreSkeleton key={i} />)}
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center card-shadow">
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <svg className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-slate-600">No stores found</p>
            <p className="text-xs">Try a different search term.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((s) => (
              <StoreCard key={s.id} store={s} onRate={openRatingModal} />
            ))}
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Rating modal */}
      {modalStore && (
        <RatingModal
          store={modalStore}
          initialRating={modalStore.user_rating}
          onClose={closeRatingModal}
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  )
}
