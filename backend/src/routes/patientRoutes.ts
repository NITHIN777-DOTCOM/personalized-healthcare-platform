import { Router } from 'express';
import { getProfile, updateProfile, getMetrics, addMetric, deleteMetric } from '../controllers/patientController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Profile operations (Patients only)
router.get('/profile', authenticate, authorize(['PATIENT']), getProfile);
router.put('/profile', authenticate, authorize(['PATIENT']), updateProfile);

// Health Metrics operations
router.get('/metrics', authenticate, authorize(['PATIENT', 'DOCTOR', 'ADMIN']), getMetrics);
router.post('/metrics', authenticate, authorize(['PATIENT']), addMetric);
router.delete('/metrics/:id', authenticate, authorize(['PATIENT', 'ADMIN']), deleteMetric);

export default router;
