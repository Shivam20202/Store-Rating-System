import api from './axios.js'

/**
 * Store-owner API helpers.
 * All endpoints require an authenticated "store_owner" role JWT.
 */

// GET /api/owner/dashboard
export const getOwnerDashboard = () => api.get('/owner/dashboard')
