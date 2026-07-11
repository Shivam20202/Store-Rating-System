import Store from '../models/Store.js';
import Rating from '../models/Rating.js';
import { validateRating, parsePagination, parseSort } from '../middleware/validate.js';
import { createError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * GET /api/user/stores
 * List all stores with search (name, address), sort, and pagination.
 * Includes the authenticated user's own rating per store.
 */
export const getStores = asyncHandler(async (req, res, next) => {
  const { search } = req.query;
  const { page, limit, offset } = parsePagination(req.query);
  const { sortBy, sortOrder } = parseSort(
    req.query,
    ['id', 'name', 'email', 'address', 'created_at', 'avg_rating'],
    'id'
  );

  const userId = req.user.id;

  // The combined search bar maps to a single `search` param that ORs
  // name and address on the backend.
  const stores = await Store.getAll({ search, sortBy, sortOrder, page, limit });
  const total = await Store.count({ search });

  // Fetch the user's ratings for the returned store ids in one shot.
  let userRatingsMap = {};
  if (stores.length) {
    const storeIds = stores.map((s) => s.id);
    const placeholders = storeIds.map(() => '?').join(',');
    const [ratingRows] = await Store._poolQuery(
      `SELECT store_id, rating FROM ratings WHERE user_id = ? AND store_id IN (${placeholders})`,
      [userId, ...storeIds]
    );
    userRatingsMap = ratingRows.reduce((acc, r) => {
      acc[r.store_id] = r.rating;
      return acc;
    }, {});
  }

  const data = stores.map((s) => ({
    ...s,
    avg_rating: Number(s.avg_rating) || 0,
    user_rating: userRatingsMap[s.id] ?? null,
  }));

  return res.status(200).json({
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * POST /api/user/ratings
 * Submit a rating for a store. A user can only rate a store once.
 */
export const submitRating = asyncHandler(async (req, res, next) => {
  const { storeId, rating } = req.body;
  const userId = req.user.id;

  // --- Validate rating value ---
  const ratingCheck = validateRating(rating);
  if (!ratingCheck.valid) return next(createError(400, ratingCheck.message));

  const storeIdNum = parseInt(storeId, 10);
  if (Number.isNaN(storeIdNum) || storeIdNum <= 0) {
    return next(createError(400, 'A valid storeId is required.'));
  }

  // --- Store must exist ---
  const store = await Store.findById(storeIdNum);
  if (!store) {
    return next(createError(404, 'Store not found.'));
  }

  // --- Prevent duplicate rating ---
  const existing = await Rating.findByUserAndStore(userId, storeIdNum);
  if (existing) {
    return next(createError(409, 'You have already rated this store. Use the update endpoint to modify it.'));
  }

  const ratingId = await Rating.create({ userId, storeId: storeIdNum, rating: Number(rating) });

  return res.status(201).json({
    message: 'Rating submitted successfully.',
    rating: {
      id: ratingId,
      user_id: userId,
      store_id: storeIdNum,
      rating: Number(rating),
    },
  });
});

/**
 * PUT /api/user/ratings/:storeId
 * Update the authenticated user's own rating for a store.
 */
export const updateRating = asyncHandler(async (req, res, next) => {
  const { storeId } = req.params;
  const { rating } = req.body;
  const userId = req.user.id;

  const ratingCheck = validateRating(rating);
  if (!ratingCheck.valid) return next(createError(400, ratingCheck.message));

  const storeIdNum = parseInt(storeId, 10);
  if (Number.isNaN(storeIdNum) || storeIdNum <= 0) {
    return next(createError(400, 'Invalid store id.'));
  }

  const existing = await Rating.findByUserAndStore(userId, storeIdNum);
  if (!existing) {
    return next(createError(404, 'You have not rated this store yet.'));
  }

  const updated = await Rating.update(existing.id, Number(rating));
  if (!updated) {
    return next(createError(500, 'Failed to update rating.'));
  }

  return res.status(200).json({
    message: 'Rating updated successfully.',
    rating: {
      id: existing.id,
      user_id: userId,
      store_id: storeIdNum,
      rating: Number(rating),
    },
  });
});
