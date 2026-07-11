import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { loginUser } from '../api/auth.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../components/Toast.jsx'

/**
 * Login page — centered card with email + password.
 * On success, stores the user in auth context and redirects by role.
 */

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
        <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.36 4.18a1 1 0 00.95.69h4.4c.97 0 1.37 1.24.59 1.81l-3.56 2.59a1 1 0 00-.36 1.12l1.36 4.18c.3.92-.76 1.69-1.54 1.12l-3.56-2.59a1 1 0 00-1.18 0l-3.56 2.59c-.78.57-1.84-.2-1.54-1.12l1.36-4.18a1 1 0 00-.36-1.12L2.7 9.61c-.78-.57-.38-1.81.59-1.81h4.4a1 1 0 00.95-.69l1.36-4.18z" />
        </svg>
      </span>
      <span className="text-xl font-bold tracking-tight text-slate-900">
        Store<span className="text-blue-600">Rate</span>
      </span>
    </div>
  )
}

export default function LoginPage() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const redirectFor = (role) =>
    role === 'admin' ? '/admin' : role === 'store_owner' ? '/owner' : '/user'

  const validate = () => {
    const e = {}
    if (!form.email.trim()) e.email = 'Email is required.'
    else if (!EMAIL_RE.test(form.email.trim())) e.email = 'Please enter a valid email address.'
    if (!form.password) e.password = 'Password is required.'
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
      const { data } = await loginUser({
        email: form.email.trim(),
        password: form.password,
      })
      login(data.user, data.token)
      showToast('Welcome back!', 'success')
      // Respect the "from" location if it was a protected route, else go by role.
      const from = location.state?.from?.pathname
      navigate(from && from !== '/login' ? from : redirectFor(data.user.role), { replace: true })
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Unable to log in. Please check your connection and try again.'
      showToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const inputBase =
    'block w-full rounded-md border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500/30'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 card-shadow">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Sign in to your account</h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter your credentials below to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="you@example.com"
                className={`${inputBase} ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
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
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange('password')}
                placeholder="••••••••"
                className={`${inputBase} ${errors.password ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
              />
              {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don’t have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
              Create one
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} StoreRate. All rights reserved.
        </p>
      </div>
    </div>
  )
}
