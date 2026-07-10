import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import config from '../config';
import { AuthenticatedRequest } from '../types';

// Helper: Generate Access and Refresh Tokens
const generateTokens = (user: { id: string; email: string; role: string }) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  
  const accessToken = jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN as any,
  });

  const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN as any,
  });

  return { accessToken, refreshToken };
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role, patientProfile, doctorProfile } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ success: false, message: 'Name, email, password, and role are required.' });
      return;
    }

    const normalizedRole = role.toUpperCase();
    if (!['PATIENT', 'DOCTOR', 'ADMIN'].includes(normalizedRole)) {
      res.status(400).json({ success: false, message: 'Invalid role. Must be PATIENT, DOCTOR, or ADMIN.' });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'A user with this email already exists.' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user and profile in a transaction
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
        if (!df.specialization || !df.licenseNumber) {
          throw new Error('Specialization and license number are required for doctors.');
        }
        await tx.doctorProfile.create({
          data: {
            userId: newUser.id,
            specialization: df.specialization,
            licenseNumber: df.licenseNumber,
            consultationFee: df.consultationFee ? parseFloat(df.consultationFee) : 0,
            bio: df.bio || null,
          },
        });
      }

      return newUser;
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Fetch user with profile to return
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
      message: 'Registration successful.',
      data: {
        user: userWithProfile,
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    if (error.message && error.message.includes('required for doctors')) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        patientProfile: true,
        doctorProfile: true,
      },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
      return;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    (user as any).password = undefined;

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'Refresh token is required.' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    // Check if user still exists
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // Generate new access and refresh tokens
    const tokens = generateTokens(user);

    res.status(200).json({
      success: true,
      message: 'Token refreshed.',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
};

// @desc    Get currently logged-in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        patientProfile: true,
        doctorProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    (user as any).password = undefined;

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Standard stateless JWT doesn't need DB storage unless blacklisting. 
    // Just returning success. Frontend handles it by deleting tokens.
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};
