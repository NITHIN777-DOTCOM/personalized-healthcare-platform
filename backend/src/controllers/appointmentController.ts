import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';

// @desc    Get all appointments (conditional on role)
// @route   GET /api/appointments
// @access  Private (Patient/Doctor/Admin)
export const getAppointments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    let appointments;

    if (req.user.role === 'PATIENT') {
      appointments = await prisma.appointment.findMany({
        where: { patientId: req.user.id },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              email: true,
              doctorProfile: true,
            },
          },
        },
        orderBy: { dateTime: 'asc' },
      });
    } else if (req.user.role === 'DOCTOR') {
      appointments = await prisma.appointment.findMany({
        where: { doctorId: req.user.id },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              email: true,
              patientProfile: true,
            },
          },
        },
        orderBy: { dateTime: 'asc' },
      });
    } else {
      // ADMIN
      appointments = await prisma.appointment.findMany({
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { dateTime: 'desc' },
      });
    }

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific appointment
// @route   GET /api/appointments/:id
// @access  Private (Patient/Doctor/Admin)
export const getAppointmentById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: { id: true, name: true, email: true, patientProfile: true },
        },
        doctor: {
          select: { id: true, name: true, email: true, doctorProfile: true },
        },
      },
    });

    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found.' });
      return;
    }

    // Auth check: Patient, Doctor, or Admin
    if (
      appointment.patientId !== req.user.id &&
      appointment.doctorId !== req.user.id &&
      req.user.role !== 'ADMIN'
    ) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
export const bookAppointment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { doctorId, dateTime, reason } = req.body;

    if (!doctorId || !dateTime) {
      res.status(400).json({ success: false, message: 'Doctor ID and Date/Time are required.' });
      return;
    }

    // Verify doctor exists
    const doctor = await prisma.user.findFirst({
      where: { id: doctorId, role: 'DOCTOR' },
    });

    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found.' });
      return;
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: req.user.id,
        doctorId,
        dateTime: new Date(dateTime),
        status: 'PENDING',
        reason: reason || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Patient/Doctor/Admin)
export const updateAppointmentStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ success: false, message: 'Status is required.' });
      return;
    }

    const normalizedStatus = status.toUpperCase();
    if (!['PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'].includes(normalizedStatus)) {
      res.status(400).json({ success: false, message: 'Invalid status value.' });
      return;
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found.' });
      return;
    }

    // Security check
    if (req.user.role === 'PATIENT') {
      // Patients can only cancel their own appointment
      if (appointment.patientId !== req.user.id) {
        res.status(403).json({ success: false, message: 'Access denied.' });
        return;
      }
      if (normalizedStatus !== 'CANCELLED') {
        res.status(400).json({ success: false, message: 'Patients can only cancel appointments.' });
        return;
      }
    } else if (req.user.role === 'DOCTOR') {
      // Doctors can only update their own appointments
      if (appointment.doctorId !== req.user.id) {
        res.status(403).json({ success: false, message: 'Access denied.' });
        return;
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status: normalizedStatus },
    });

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${normalizedStatus}.`,
      data: updatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment notes (by Doctor)
// @route   PUT /api/appointments/:id/notes
// @access  Private (Doctor)
export const updateAppointmentNotes = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { id } = req.params;
    const { notes } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found.' });
      return;
    }

    if (appointment.doctorId !== req.user.id) {
      res.status(403).json({ success: false, message: 'Access denied. Only the assigned doctor can write notes.' });
      return;
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { notes },
    });

    res.status(200).json({
      success: true,
      message: 'Appointment notes updated.',
      data: updatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};
