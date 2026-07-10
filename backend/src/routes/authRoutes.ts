import { Router } from 'express';
import { register, login, refresh, logout, getMe } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Register a new user (Patient, Doctor, Admin)
router.post('/register', register);

// Login
router.post('/login', login);

// Refresh Token
router.post('/refresh', refresh);

// Get current user profile (requires Auth)
router.get('/me', authenticate, getMe);

// Logout
router.post('/logout', authenticate, logout);

export default router;
