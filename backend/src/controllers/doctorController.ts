import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';

// @desc    Get all doctors (for patient booking)
// @route   GET /api/doctors/list
// @access  Private (Patient/Doctor/Admin)
export const listDoctors = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        doctorProfile: true,
      },
    });

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor profile
// @route   GET /api/doctors/profile
// @access  Private (Doctor)
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const profile = await prisma.doctorProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!profile) {
      res.status(404).json({ success: false, message: 'Doctor profile not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (Doctor)
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { specialization, licenseNumber, consultationFee, bio } = req.body;

    const updatedProfile = await prisma.doctorProfile.update({
      where: { userId: req.user.id },
      data: {
        specialization: specialization !== undefined ? specialization : undefined,
        licenseNumber: licenseNumber !== undefined ? licenseNumber : undefined,
        consultationFee: consultationFee !== undefined ? (consultationFee ? parseFloat(consultationFee) : 0) : undefined,
        bio: bio !== undefined ? bio : undefined,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of patients for the logged-in doctor
// @route   GET /api/doctors/my-patients
// @access  Private (Doctor)
export const getMyPatients = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    // Find all unique patient IDs from appointments with this doctor
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: req.user.id },
      select: { patientId: true },
    });

    const patientIds = Array.from(new Set(appointments.map((a) => a.patientId)));

    const patients = await prisma.user.findMany({
      where: {
        id: { in: patientIds },
        role: 'PATIENT',
      },
      select: {
        id: true,
        name: true,
        email: true,
        patientProfile: true,
      },
    });

    res.status(200).json({
      success: true,
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};
