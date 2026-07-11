import { Router } from 'express';
import { getDashboard } from '../controllers/ownerController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

// All owner routes require an authenticated store_owner user.
router.use(verifyToken, requireRole('store_owner'));

// GET /api/owner/dashboard - store info, avg rating, list of raters
router.get('/dashboard', getDashboard);

export default router;
