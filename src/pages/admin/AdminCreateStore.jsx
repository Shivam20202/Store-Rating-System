import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createStore } from '../../api/admin.js'
import { getUsers } from '../../api/admin.js'
import { useToast } from '../../components/Toast.jsx'

/**
 * Admin → Create store.
 * Fields: Store Name, Email, Address, Owner Email.
 *
 * The backend requires an owner_id (a store_owner user). To keep the form
 * friendly we let the admin type the owner's email; we resolve it to an id
 * by searching admin users with role=store_owner, then submit createStore
 * with the resolved owner_id.
 */

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export default function AdminCreateStore() {
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    ownerEmail: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [resolving, setResolving] = useState(false)

  const validate = () => {
    const e = {}
    const name = form.name.trim()
    if (!name) e.name = 'Store name is required.'
    else if (name.length < 20) e.name = 'Name must be at least 20 characters long.'
    else if (name.length > 60) e.name = 'Name must be at most 60 characters long.'

    if (!form.email.trim()) e.email = 'Email is required.'
    else if (!EMAIL_RE.test(form.email.trim())) e.email = 'Please enter a valid email address.'

    const address = form.address.trim()
    if (!address) e.address = 'Address is required.'
    else if (address.length > 400) e.address = 'Address must be at most 400 characters long.'

    if (!form.ownerEmail.trim()) e.ownerEmail = 'Owner email is required.'
    else if (!EMAIL_RE.test(form.ownerEmail.trim())) e.ownerEmail = 'Please enter a valid owner email address.'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (field) => (ev) => {
    setForm((f) => ({ ...f, [field]: ev.target.value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }))
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setResolving(true)
    try {
      // Resolve the owner by email among store_owner users.
      const { data: userRes } = await getUsers({
        email: form.ownerEmail.trim(),
        role: 'store_owner',
        limit: 100,
      })
      const candidates = (userRes.data || []).filter(
        (u) => u.email.toLowerCase() === form.ownerEmail.trim().toLowerCase() && u.role === 'store_owner',
      )
      if (candidates.length === 0) {
        setErrors((p) => ({
          ...p,
          ownerEmail: 'No store owner found with that email.',
        }))
        showToast('No store owner found with that email.', 'error')
        return
      }
      const owner = candidates[0]

      // Create the store with the resolved owner_id.
      await createStore({
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        owner_id: owner.id,
      })
      showToast('Store created successfully.', 'success')
      navigate('/admin/stores', { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create store.'
      showToast(msg, 'error')
    } finally {
      setResolving(false)
      setSubmitting(false)
    }
  }

  const inputBase =
    'block w-full rounded-md border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/30'
  const fieldBorder = (err) =>
    err ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link to="/admin/stores" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.7 5.3a1 1 0 010 1.4L9.4 10l3.3 3.3a1 1 0 01-1.4 1.4l-4-4a1 1 0 010-1.4l4-4a1 1 0 011.4 0z" clipRule="evenodd" />
          </svg>
          Back to stores
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Create new store</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add a store and assign it to an existing store owner.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 card-shadow sm:p-8" noValidate>
        <div className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
              Store name
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="20–60 characters"
              className={`${inputBase} ${fieldBorder(errors.name)}`}
            />
            {errors.name ? (
              <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-400">Must be 20–60 characters.</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
              Store email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="store@example.com"
              className={`${inputBase} ${fieldBorder(errors.email)}`}
            />
            {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-slate-700">
              Address
            </label>
            <textarea
              id="address"
              rows={2}
              value={form.address}
              onChange={handleChange('address')}
              placeholder="Store street address"
              className={`${inputBase} ${fieldBorder(errors.address)}`}
            />
            {errors.address ? (
              <p className="mt-1.5 text-sm text-red-600">{errors.address}</p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-400">Max 400 characters.</p>
            )}
          </div>

          <div>
            <label htmlFor="ownerEmail" className="mb-1.5 block text-sm font-medium text-slate-700">
              Owner email
            </label>
            <input
              id="ownerEmail"
              type="email"
              value={form.ownerEmail}
              onChange={handleChange('ownerEmail')}
              placeholder="owner@example.com"
              className={`${inputBase} ${fieldBorder(errors.ownerEmail)}`}
            />
            {errors.ownerEmail ? (
              <p className="mt-1.5 text-sm text-red-600">{errors.ownerEmail}</p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-400">
                The email of an existing user with the <span className="font-medium">store_owner</span> role.
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {resolving ? 'Resolving owner…' : submitting ? 'Creating…' : 'Create store'}
          </button>
          <Link
            to="/admin/stores"
            className="rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
