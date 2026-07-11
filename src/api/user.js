import api from './axios.js'

/**
 * User API helpers.
 * All endpoints require an authenticated "user" role JWT.
 */

// GET /api/user/stores — params: { name, address, sortBy, sortOrder, page, limit }
export const getUserStores = (params = {}) =>
  api.get('/user/stores', { params })

// POST /api/user/ratings — data: { storeId, rating }
export const submitRating = (data) => api.post('/user/ratings', data)

// PUT /api/user/ratings/:storeId — data: { rating }
export const updateRating = (storeId, data) =>
  api.put(`/user/ratings/${storeId}`, data)
