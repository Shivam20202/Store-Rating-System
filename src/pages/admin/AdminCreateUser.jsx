import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUser } from '../../api/admin.js'
import { useToast } from '../../components/Toast.jsx'

/**
 * Admin → Create user.
 * Form fields: name, email, password, address, role (dropdown).
 * Full client-side validation mirroring the backend rules.
 */

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const SPECIAL_RE = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/

export default function AdminCreateUser() {
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const e = {}
    const name = form.name.trim()
    if (!name) e.name = 'Name is required.'
    else if (name.length < 20) e.name = 'Name must be at least 20 characters long.'
    else if (name.length > 60) e.name = 'Name must be at most 60 characters long.'

    if (!form.email.trim()) e.email = 'Email is required.'
    else if (!EMAIL_RE.test(form.email.trim())) e.email = 'Please enter a valid email address.'

    const address = form.address.trim()
    if (!address) e.address = 'Address is required.'
    else if (address.length > 400) e.address = 'Address must be at most 400 characters long.'

    const pw = form.password
    if (!pw) e.password = 'Password is required.'
    else if (pw.length < 8 || pw.length > 16) e.password = 'Password must be 8–16 characters long.'
    else if (!/[A-Z]/.test(pw)) e.password = 'Password must contain at least one uppercase letter.'
    else if (!SPECIAL_RE.test(pw)) e.password = 'Password must contain at least one special character.'

    if (!form.role) e.role = 'Role is required.'

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
    try {
      await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        address: form.address.trim(),
        role: form.role,
      })
      showToast('User created successfully.', 'success')
      navigate('/admin/users', { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create user.'
      showToast(msg, 'error')
    } finally {
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
        <Link to="/admin/users" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.7 5.3a1 1 0 010 1.4L9.4 10l3.3 3.3a1 1 0 01-1.4 1.4l-4-4a1 1 0 010-1.4l4-4a1 1 0 011.4 0z" clipRule="evenodd" />
          </svg>
          Back to users
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Create new user</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add a new account with any role (user, admin, or store owner).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 card-shadow sm:p-8" noValidate>
        <div className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
              Full name
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
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="you@example.com"
              className={`${inputBase} ${fieldBorder(errors.email)}`}
            />
            {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              placeholder="8–16 chars, 1 uppercase, 1 special"
              className={`${inputBase} ${fieldBorder(errors.password)}`}
            />
            {errors.password ? (
              <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-400">
                8–16 chars, at least one uppercase and one special character.
              </p>
            )}
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
              placeholder="Street address"
              className={`${inputBase} ${fieldBorder(errors.address)}`}
            />
            {errors.address ? (
              <p className="mt-1.5 text-sm text-red-600">{errors.address}</p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-400">Max 400 characters.</p>
            )}
          </div>

          <div>
            <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              id="role"
              value={form.role}
              onChange={handleChange('role')}
              className={`${inputBase} ${fieldBorder(errors.role)}`}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="store_owner">Store Owner</option>
            </select>
            {errors.role && <p className="mt-1.5 text-sm text-red-600">{errors.role}</p>}
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
            {submitting ? 'Creating…' : 'Create user'}
          </button>
          <Link
            to="/admin/users"
            className="rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
