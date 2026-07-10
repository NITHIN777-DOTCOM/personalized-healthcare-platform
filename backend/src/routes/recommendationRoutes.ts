import { Router } from 'express';
import {
  getRecommendations,
  createRecommendation,
  deleteRecommendation,
  generateAIRecommendation,
} from '../controllers/recommendationController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Retrieve recommendations
router.get('/', authenticate, getRecommendations);

// Create recommendation (Doctors only)
router.post('/', authenticate, authorize(['DOCTOR']), createRecommendation);

// Generate AI recommendation based on vitals (Doctors only)
router.post('/generate', authenticate, authorize(['DOCTOR']), generateAIRecommendation);

// Delete recommendation (Doctor/Admin)
router.delete('/:id', authenticate, authorize(['DOCTOR', 'ADMIN']), deleteRecommendation);

export default router;
