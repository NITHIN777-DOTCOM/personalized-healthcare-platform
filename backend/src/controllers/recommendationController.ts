import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';

// @desc    Get recommendations (conditional on role)
// @route   GET /api/recommendations
// @access  Private (Patient/Doctor)
export const getRecommendations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    let recommendations;

    if (req.user.role === 'PATIENT') {
      recommendations = await prisma.recommendation.findMany({
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
        orderBy: { createdAt: 'desc' },
      });
    } else if (req.user.role === 'DOCTOR') {
      recommendations = await prisma.recommendation.findMany({
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
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // ADMIN can see all recommendations
      recommendations = await prisma.recommendation.findMany({
        include: {
          patient: { select: { id: true, name: true, email: true } },
          doctor: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new recommendation for a patient
// @route   POST /api/recommendations
// @access  Private (Doctor)
export const createRecommendation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { patientId, title, description } = req.body;

    if (!patientId || !title || !description) {
      res.status(400).json({ success: false, message: 'Patient ID, title, and description are required.' });
      return;
    }

    // Verify patient exists
    const patient = await prisma.user.findFirst({
      where: { id: patientId, role: 'PATIENT' },
    });

    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found.' });
      return;
    }

    const recommendation = await prisma.recommendation.create({
      data: {
        doctorId: req.user.id,
        patientId,
        title,
        description,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Recommendation sent successfully.',
      data: recommendation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a recommendation
// @route   DELETE /api/recommendations/:id
// @access  Private (Doctor)
export const deleteRecommendation = async (
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

    const recommendation = await prisma.recommendation.findUnique({
      where: { id },
    });

    if (!recommendation) {
      res.status(404).json({ success: false, message: 'Recommendation not found.' });
      return;
    }

    // Auth check: Only the doctor who created it or Admin
    if (recommendation.doctorId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    await prisma.recommendation.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Recommendation deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI recommendation based on patient's latest vitals
// @route   POST /api/recommendations/generate
// @access  Private (Doctor)
export const generateAIRecommendation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { patientId } = req.body;
    if (!patientId) {
      res.status(400).json({ success: false, message: 'Patient ID is required.' });
      return;
    }

    // Retrieve latest vitals of the patient
    const [stepsMetric, sleepMetric, bpMetric] = await Promise.all([
      prisma.healthMetric.findFirst({
        where: { patientId, type: 'STEPS' },
        orderBy: { recordedAt: 'desc' }
      }),
      prisma.healthMetric.findFirst({
        where: { patientId, type: 'SLEEP' },
        orderBy: { recordedAt: 'desc' }
      }),
      prisma.healthMetric.findFirst({
        where: { patientId, type: 'BLOOD_PRESSURE' },
        orderBy: { recordedAt: 'desc' }
      })
    ]);

    const vitals = {
      steps: stepsMetric?.value || '0',
      sleep: sleepMetric?.value || '0',
      bloodPressure: bpMetric?.value || ''
    };

    // Use AI Provider (abstracted factory selects Local or Azure OpenAI dynamically)
    const { aiProvider } = await import('../providers');
    const advice = await aiProvider.generateRecommendations(vitals);

    res.status(200).json({
      success: true,
      data: {
        patientId,
        title: 'AI Diagnostic Advice',
        description: advice
      }
    });
  } catch (error) {
    next(error);
  }
};
