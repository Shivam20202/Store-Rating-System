import api from './axios.js'

/**
 * Auth API helpers.
 * Each returns the axios response so callers can read .data and .status.
 */

// POST /api/auth/register
export const registerUser = (data) =>
  api.post('/auth/register', data)

// POST /api/auth/login
export const loginUser = (data) =>
  api.post('/auth/login', data)

// PUT /api/auth/change-password  (authenticated)
export const changePassword = (data) =>
  api.put('/auth/change-password', data)
