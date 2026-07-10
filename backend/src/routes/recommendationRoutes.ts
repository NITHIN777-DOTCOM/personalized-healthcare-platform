import { Router } from 'express';
import {
  getRecommendations,
  createRecommendation,
  deleteRecommendation,
} from '../controllers/recommendationController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Retrieve recommendations
router.get('/', authenticate, getRecommendations);

// Create recommendation (Doctors only)
router.post('/', authenticate, authorize(['DOCTOR']), createRecommendation);

// Delete recommendation (Doctor/Admin)
router.delete('/:id', authenticate, authorize(['DOCTOR', 'ADMIN']), deleteRecommendation);

export default router;
