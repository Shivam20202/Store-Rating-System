import axios from 'axios'

/**
 * Shared axios instance for the Store Rating backend.
 * Base URL comes from VITE_API_URL (defaults to the local dev server).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Request interceptor — attach the JWT from localStorage if present.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

/**
 * Response interceptor — on a 401, clear stored auth and bounce to /login.
 * We use window.location so this works regardless of React Router context.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Avoid a redirect loop if we're already on a public page.
      if (!['/login', '/register'].includes(window.location.pathname)) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
