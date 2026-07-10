import { Router } from 'express';
import {
  getAppointments,
  getAppointmentById,
  bookAppointment,
  updateAppointmentStatus,
  updateAppointmentNotes,
} from '../controllers/appointmentController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Retrieve appointments list or a specific appointment
router.get('/', authenticate, getAppointments);
router.get('/:id', authenticate, getAppointmentById);

// Book appointment (Patients only)
router.post('/', authenticate, authorize(['PATIENT']), bookAppointment);

// Update status (Patient: cancel, Doctor/Admin: approve/cancel/complete)
router.put('/:id/status', authenticate, updateAppointmentStatus);

// Update notes (Doctors only)
router.put('/:id/notes', authenticate, authorize(['DOCTOR']), updateAppointmentNotes);

export default router;
