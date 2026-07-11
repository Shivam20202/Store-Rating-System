import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { changePassword } from '../../api/auth.js'
import { useToast } from '../../components/Toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

/**
 * Change password — shared by all roles.
 * Fields: current password, new password, confirm password.
 * New password validation: 8–16 chars, ≥1 uppercase, ≥1 special char.
 * New password must differ from current password (enforced server-side too).
 */

const SPECIAL_RE = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/

export default function ChangePassword() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.currentPassword) e.currentPassword = 'Current password is required.'

    const pw = form.newPassword
    if (!pw) e.newPassword = 'New password is required.'
    else if (pw.length < 8 || pw.length > 16) e.newPassword = 'Password must be 8–16 characters long.'
    else if (!/[A-Z]/.test(pw)) e.newPassword = 'Password must contain at least one uppercase letter.';
    else if (!SPECIAL_RE.test(pw)) e.newPassword = 'Password must contain at least one special character.';

    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your new password.'
    else if (form.confirmPassword !== form.newPassword) e.confirmPassword = 'Passwords do not match.'

    if (form.currentPassword && form.newPassword && form.currentPassword === form.newPassword) {
      e.newPassword = 'New password must be different from your current password.'
    }

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
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      showToast('Password updated successfully.', 'success')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      // Redirect back to the role dashboard.
      const dest =
        user?.role === 'admin' ? '/admin' : user?.role === 'store_owner' ? '/owner' : '/user'
      navigate(dest, { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to change password.'
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
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Change password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Update your account password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 card-shadow sm:p-8" noValidate>
        <div className="space-y-5">
          <div>
            <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-medium text-slate-700">
              Current password
            </label>
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={handleChange('currentPassword')}
              placeholder="••••••••"
              className={`${inputBase} ${fieldBorder(errors.currentPassword)}`}
            />
            {errors.currentPassword && <p className="mt-1.5 text-sm text-red-600">{errors.currentPassword}</p>}
          </div>

          <div>
            <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-slate-700">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={form.newPassword}
              onChange={handleChange('newPassword')}
              placeholder="8–16 chars, 1 uppercase, 1 special"
              className={`${inputBase} ${fieldBorder(errors.newPassword)}`}
            />
            {errors.newPassword ? (
              <p className="mt-1.5 text-sm text-red-600">{errors.newPassword}</p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-400">
                8–16 chars, at least one uppercase and one special character.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-slate-700">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              placeholder="Re-enter new password"
              className={`${inputBase} ${fieldBorder(errors.confirmPassword)}`}
            />
            {errors.confirmPassword && <p className="mt-1.5 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {submitting ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </form>
    </div>
  )
}
