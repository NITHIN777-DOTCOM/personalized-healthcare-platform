import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';

// @desc    Get patient profile
// @route   GET /api/patients/profile
// @access  Private (Patient)
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

    const profile = await prisma.patientProfile.findUnique({
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
      res.status(404).json({ success: false, message: 'Patient profile not found.' });
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

// @desc    Update patient profile
// @route   PUT /api/patients/profile
// @access  Private (Patient)
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

    const { dateOfBirth, gender, bloodType, height, weight, allergies, medicalHistory } = req.body;

    const updatedProfile = await prisma.patientProfile.update({
      where: { userId: req.user.id },
      data: {
        dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : undefined,
        gender: gender !== undefined ? gender : undefined,
        bloodType: bloodType !== undefined ? bloodType : undefined,
        height: height !== undefined ? (height ? parseFloat(height) : null) : undefined,
        weight: weight !== undefined ? (weight ? parseFloat(weight) : null) : undefined,
        allergies: allergies !== undefined ? allergies : undefined,
        medicalHistory: medicalHistory !== undefined ? medicalHistory : undefined,
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

// @desc    Get patient health metrics
// @route   GET /api/patients/metrics
// @access  Private (Patient/Doctor/Admin)
export const getMetrics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    let targetPatientId = req.user.id;

    // Doctors and Admins can view other patient's metrics by passing query param patientId
    if (req.user.role !== 'PATIENT' && req.query.patientId) {
      targetPatientId = req.query.patientId as string;
    }

    const metrics = await prisma.healthMetric.findMany({
      where: { patientId: targetPatientId },
      orderBy: { recordedAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new health metric
// @route   POST /api/patients/metrics
// @access  Private (Patient)
export const addMetric = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { type, value, unit } = req.body;

    if (!type || !value || !unit) {
      res.status(400).json({ success: false, message: 'Metric type, value, and unit are required.' });
      return;
    }

    const newMetric = await prisma.healthMetric.create({
      data: {
        patientId: req.user.id,
        type: type.toUpperCase(),
        value,
        unit,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Health metric recorded.',
      data: newMetric,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete health metric
// @route   DELETE /api/patients/metrics/:id
// @access  Private (Patient)
export const deleteMetric = async (
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

    const metric = await prisma.healthMetric.findUnique({
      where: { id },
    });

    if (!metric) {
      res.status(404).json({ success: false, message: 'Metric not found.' });
      return;
    }

    if (metric.patientId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Access denied. You can only delete your own metrics.' });
      return;
    }

    await prisma.healthMetric.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Health metric deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
