import { Router } from 'express';
import { getStats, getUsers, createUser, updateUser, deleteUser } from '../controllers/adminController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Apply auth and admin check to all routes in this file
router.use(authenticate, authorize(['ADMIN']));

// Statistics route
router.get('/stats', getStats);

// User CRUD management
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
