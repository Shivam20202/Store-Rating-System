import api from './axios.js'

/**
 * Admin API helpers.
 * All endpoints require an authenticated admin JWT (added by interceptor).
 */

// GET /api/admin/stats
export const getStats = () => api.get('/admin/stats')

// GET /api/admin/users  — params: { name, email, address, role, sortBy, sortOrder, page, limit }
export const getUsers = (params = {}) =>
  api.get('/admin/users', { params })

// POST /api/admin/users
export const createUser = (data) => api.post('/admin/users', data)

// GET /api/admin/users/:id
export const getUserById = (id) => api.get(`/admin/users/${id}`)

// GET /api/admin/stores — params: { name, email, address, sortBy, sortOrder, page, limit }
export const getStores = (params = {}) =>
  api.get('/admin/stores', { params })

// POST /api/admin/stores
export const createStore = (data) => api.post('/admin/stores', data)
