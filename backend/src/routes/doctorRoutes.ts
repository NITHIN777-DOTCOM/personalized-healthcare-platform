import { Router } from 'express';
import { listDoctors, getProfile, updateProfile, getMyPatients } from '../controllers/doctorController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

// General operations
router.get('/list', authenticate, listDoctors);

// Doctor-only profile operations
router.get('/profile', authenticate, authorize(['DOCTOR']), getProfile);
router.put('/profile', authenticate, authorize(['DOCTOR']), updateProfile);

// Patient listing for doctor
router.get('/my-patients', authenticate, authorize(['DOCTOR']), getMyPatients);

export default router;
