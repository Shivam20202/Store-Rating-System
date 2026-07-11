import { Router } from 'express';
import {
  getStats,
  getUsers,
  createUser,
  getUserById,
  getStores,
  createStore,
} from '../controllers/adminController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

// All admin routes require an authenticated admin user.
router.use(verifyToken, requireRole('admin'));

// GET /api/admin/stats
router.get('/stats', getStats);

// GET /api/admin/users - list with filters/sort/pagination
router.get('/users', getUsers);

// POST /api/admin/users - create user of any role
router.post('/users', createUser);

// GET /api/admin/users/:id - user detail (store_owner includes avg rating)
router.get('/users/:id', getUserById);

// GET /api/admin/stores - list stores with filters/sort/pagination
router.get('/stores', getStores);

// POST /api/admin/stores - create store with owner_id
router.post('/stores', createStore);

export default router;
