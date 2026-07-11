import Store from '../models/Store.js';
import Rating from '../models/Rating.js';
import { createError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * GET /api/owner/dashboard
 * Returns the authenticated store_owner's store info, average rating,
 * and the list of users who have rated the store.
 */
export const getDashboard = asyncHandler(async (req, res, next) => {
  const ownerId = req.user.id;

  const store = await Store.findByOwnerId(ownerId);
  if (!store) {
    return next(createError(404, 'You do not have a store associated with your account.'));
  }

  const { avgRating, totalRatings } = await Store.getAvgRating(store.id);
  const raters = await Rating.getRatingsForStore(store.id);

  return res.status(200).json({
    store: {
      ...store,
      avg_rating: avgRating,
      total_ratings: totalRatings,
    },
    raters,
  });
});
