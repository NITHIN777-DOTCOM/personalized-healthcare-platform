import { Router } from 'express';
import authRoutes from './authRoutes';
import patientRoutes from './patientRoutes';
import doctorRoutes from './doctorRoutes';
import appointmentRoutes from './appointmentRoutes';
import recommendationRoutes from './recommendationRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

// Route Namespace mappings
router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/admin', adminRoutes);

export default router;
