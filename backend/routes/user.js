import { Router } from 'express';
import { getStores, submitRating, updateRating } from '../controllers/userController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

// All user routes require an authenticated user with the "user" role.
router.use(verifyToken, requireRole('user'));

// GET /api/user/stores - list stores with search, includes own rating per store
router.get('/stores', getStores);

// POST /api/user/ratings - submit a rating for a store
router.post('/ratings', submitRating);

// PUT /api/user/ratings/:storeId - update own rating for a store
router.put('/ratings/:storeId', updateRating);

export default router;
