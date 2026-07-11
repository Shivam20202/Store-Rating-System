import { Router } from 'express';
import { register, login, changePassword } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register - public, creates a "user" role account
router.post('/register', register);

// POST /api/auth/login - public, returns JWT
router.post('/login', login);

// PUT /api/auth/change-password - authenticated, changes own password
router.put('/change-password', verifyToken, changePassword);

export default router;
