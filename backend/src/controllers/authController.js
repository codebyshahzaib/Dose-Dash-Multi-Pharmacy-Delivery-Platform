import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

/* ── Constants ───────────────────────────────────────────────────── */
const PUBLIC_ROLES = ['CUSTOMER', 'PHARMACY_OWNER'];

// Maps role → the Prisma relation name for nested profile creation
const PROFILE_RELATION = {
  CUSTOMER:       'customer',
  PHARMACIST:     'pharmacist',
  PHARMACY_OWNER: 'pharmacyOwner',
  RIDER:          'rider',
};

/* ── Helpers ─────────────────────────────────────────────────────── */
const generateToken = (userId, email, role) =>
  jwt.sign({ id: userId, email, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

const setAuthCookie = (res, token) =>
  res.cookie('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

const clearAuthCookie = (res) =>
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

/* ── POST /auth/register ─────────────────────────────────────────── */
export const register = async (req, res) => {
  try {
    const { email, password, name, phone, role, city } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const normalizedRole = (role || 'CUSTOMER').toUpperCase();
    if (!PUBLIC_ROLES.includes(normalizedRole)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create user + role profile in one transaction
    const profileKey = PROFILE_RELATION[normalizedRole];
    
    let prepareData = {
      email,
      passwordHash,
      name,
      phone: phone || null,
      role: normalizedRole,
      ...(profileKey ? { [profileKey]: { create: {} } } : {}),
    };

    // Special logic for initial profile fields
    if (normalizedRole === 'CUSTOMER') {
      prepareData.customer = { create: { city: city || null } };
    } else if (normalizedRole === 'PHARMACIST') {
      prepareData.pharmacist = { create: { isAvailable: false } };
    } else if (normalizedRole === 'RIDER') {
      prepareData.rider = { create: { city: city || null, isAvailable: true } };
    } else if (normalizedRole === 'PHARMACY_OWNER') {
      prepareData.pharmacyOwner = {
        create: {
          pharmacy: {
            create: { 
              name: `${name}'s Pharmacy`,
              city: city || 'Lahore' // Default city or from request
            }
          }
        }
      };
    }

    const newUser = await prisma.user.create({
      data: prepareData,
      select: { id: true, email: true, name: true, phone: true, role: true },
    });

    return res.status(201).json({
      message: 'Account created! Please log in.',
      user: newUser,
    });
  } catch (err) {
    console.error('❌ /register error:', err.message);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

/* ── POST /auth/login ────────────────────────────────────────────── */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user.id, user.email, user.role);
    setAuthCookie(res, token);

    return res.json({
      message: 'Login successful.',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error('❌ /login error:', err.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

/* ── POST /auth/logout ───────────────────────────────────────────── */
export const logout = (_req, res) => {
  clearAuthCookie(res);
  return res.json({ message: 'Logged out.' });
};

/* ── GET /auth/me ────────────────────────────────────────────────── */
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ message: 'User not found.' });

    return res.json({ user });
  } catch (err) {
    console.error('❌ /me error:', err.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};
