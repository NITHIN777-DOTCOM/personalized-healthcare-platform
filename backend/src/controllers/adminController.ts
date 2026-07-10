import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';

// @desc    Get dashboard metrics & stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getStats = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalPatients = await prisma.user.count({ where: { role: 'PATIENT' } });
    const totalDoctors = await prisma.user.count({ where: { role: 'DOCTOR' } });
    const totalAdmins = await prisma.user.count({ where: { role: 'ADMIN' } });
    
    const totalAppointments = await prisma.appointment.count();
    const pendingAppointments = await prisma.appointment.count({ where: { status: 'PENDING' } });
    const completedAppointments = await prisma.appointment.count({ where: { status: 'COMPLETED' } });
    
    const totalMetrics = await prisma.healthMetric.count();
    const totalRecommendations = await prisma.recommendation.count();

    // Fetch some recent appointments
    const recentAppointments = await prisma.appointment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { name: true, email: true } },
        doctor: { select: { name: true, email: true } },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        users: {
          patients: totalPatients,
          doctors: totalDoctors,
          admins: totalAdmins,
          total: totalPatients + totalDoctors + totalAdmins,
        },
        appointments: {
          total: totalAppointments,
          pending: pendingAppointments,
          completed: completedAppointments,
        },
        metrics: {
          totalRecorded: totalMetrics,
        },
        recommendations: {
          totalCreated: totalRecommendations,
        },
        recentAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      include: {
        patientProfile: true,
        doctorProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Remove passwords
    const sanitizedUsers = users.map((user) => {
      (user as any).password = undefined;
      return user;
    });

    res.status(200).json({
      success: true,
      data: sanitizedUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a user (any role)
// @route   POST /api/admin/users
// @access  Private (Admin)
export const createUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role, patientProfile, doctorProfile } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ success: false, message: 'Name, email, password, and role are required.' });
      return;
    }

    const normalizedRole = role.toUpperCase();
    if (!['PATIENT', 'DOCTOR', 'ADMIN'].includes(normalizedRole)) {
      res.status(400).json({ success: false, message: 'Invalid role.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'A user with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: normalizedRole,
        },
      });

      if (normalizedRole === 'PATIENT') {
        const pf = patientProfile || {};
        await tx.patientProfile.create({
          data: {
            userId: newUser.id,
            dateOfBirth: pf.dateOfBirth || null,
            gender: pf.gender || null,
            bloodType: pf.bloodType || null,
            height: pf.height ? parseFloat(pf.height) : null,
            weight: pf.weight ? parseFloat(pf.weight) : null,
            allergies: pf.allergies || null,
            medicalHistory: pf.medicalHistory || null,
          },
        });
      } else if (normalizedRole === 'DOCTOR') {
        const df = doctorProfile || {};
        await tx.doctorProfile.create({
          data: {
            userId: newUser.id,
            specialization: df.specialization || 'General Practice',
            licenseNumber: df.licenseNumber || 'PENDING',
            consultationFee: df.consultationFee ? parseFloat(df.consultationFee) : 0,
            bio: df.bio || null,
          },
        });
      }

      return newUser;
    });

    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        patientProfile: true,
        doctorProfile: true,
      },
    });

    if (userWithProfile) {
      (userWithProfile as any).password = undefined;
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: userWithProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role, patientProfile, doctorProfile, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (role) {
      const normalizedRole = role.toUpperCase();
      if (['PATIENT', 'DOCTOR', 'ADMIN'].includes(normalizedRole)) {
        dataToUpdate.role = normalizedRole;
      }
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const usr = await tx.user.update({
        where: { id },
        data: dataToUpdate,
      });

      if (usr.role === 'PATIENT' && patientProfile) {
        await tx.patientProfile.upsert({
          where: { userId: id },
          update: {
            dateOfBirth: patientProfile.dateOfBirth !== undefined ? patientProfile.dateOfBirth : undefined,
            gender: patientProfile.gender !== undefined ? patientProfile.gender : undefined,
            bloodType: patientProfile.bloodType !== undefined ? patientProfile.bloodType : undefined,
            height: patientProfile.height !== undefined ? (patientProfile.height ? parseFloat(patientProfile.height) : null) : undefined,
            weight: patientProfile.weight !== undefined ? (patientProfile.weight ? parseFloat(patientProfile.weight) : null) : undefined,
            allergies: patientProfile.allergies !== undefined ? patientProfile.allergies : undefined,
            medicalHistory: patientProfile.medicalHistory !== undefined ? patientProfile.medicalHistory : undefined,
          },
          create: {
            userId: id,
            dateOfBirth: patientProfile.dateOfBirth || null,
            gender: patientProfile.gender || null,
            bloodType: patientProfile.bloodType || null,
            height: patientProfile.height ? parseFloat(patientProfile.height) : null,
            weight: patientProfile.weight ? parseFloat(patientProfile.weight) : null,
            allergies: patientProfile.allergies || null,
            medicalHistory: patientProfile.medicalHistory || null,
          },
        });
      } else if (usr.role === 'DOCTOR' && doctorProfile) {
        await tx.doctorProfile.upsert({
          where: { userId: id },
          update: {
            specialization: doctorProfile.specialization !== undefined ? doctorProfile.specialization : undefined,
            licenseNumber: doctorProfile.licenseNumber !== undefined ? doctorProfile.licenseNumber : undefined,
            consultationFee: doctorProfile.consultationFee !== undefined ? (doctorProfile.consultationFee ? parseFloat(doctorProfile.consultationFee) : 0) : undefined,
            bio: doctorProfile.bio !== undefined ? doctorProfile.bio : undefined,
          },
          create: {
            userId: id,
            specialization: doctorProfile.specialization || 'General Practice',
            licenseNumber: doctorProfile.licenseNumber || 'PENDING',
            consultationFee: doctorProfile.consultationFee ? parseFloat(doctorProfile.consultationFee) : 0,
            bio: doctorProfile.bio || null,
          },
        });
      }

      return usr;
    });

    const userWithProfile = await prisma.user.findUnique({
      where: { id: updatedUser.id },
      include: {
        patientProfile: true,
        doctorProfile: true,
      },
    });

    if (userWithProfile) {
      (userWithProfile as any).password = undefined;
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: userWithProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.user?.id === id) {
      res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    await prisma.user.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'User and all related records deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
