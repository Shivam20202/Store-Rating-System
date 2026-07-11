import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
} from '../middleware/validate.js';
import { createError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * POST /api/auth/register
 * Public registration — always creates a "user" role account.
 */
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, address } = req.body;

  // --- Validation ---
  const nameCheck = validateName(name);
  if (!nameCheck.valid) return next(createError(400, nameCheck.message));

  const emailCheck = validateEmail(email);
  if (!emailCheck.valid) return next(createError(400, emailCheck.message));

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) return next(createError(400, passwordCheck.message));

  const addressCheck = validateAddress(address);
  if (!addressCheck.valid) return next(createError(400, addressCheck.message));

  // --- Duplicate email check ---
  const existing = await User.findByEmail(email.trim());
  if (existing) {
    return next(createError(409, 'A user with this email already exists.'));
  }

  // --- Hash & create ---
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const userId = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    address: address.trim(),
    role: 'user',
  });

  return res.status(201).json({
    message: 'User registered successfully.',
    user: { id: userId, name: name.trim(), email: email.trim().toLowerCase(), role: 'user' },
  });
});

/**
 * POST /api/auth/login
 * Authenticates user and returns a signed JWT.
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(createError(400, 'Email and password are required.'));
  }

  const emailCheck = validateEmail(email);
  if (!emailCheck.valid) return next(createError(400, 'Invalid credentials.'));

  const user = await User.findByEmail(email.trim().toLowerCase());
  if (!user) {
    return next(createError(401, 'Invalid email or password.'));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(createError(401, 'Invalid email or password.'));
  }

  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not configured.');
    return next(createError(500, 'Server configuration error.'));
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  const token = jwt.sign(payload, secret, { expiresIn });

  return res.status(200).json({
    message: 'Login successful.',
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

/**
 * PUT /api/auth/change-password
 * Authenticated user changes their own password.
 */
export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(createError(400, 'Current password and new password are required.'));
  }

  const passwordCheck = validatePassword(newPassword);
  if (!passwordCheck.valid) return next(createError(400, passwordCheck.message));

  if (currentPassword === newPassword) {
    return next(createError(400, 'New password must be different from the current password.'));
  }

  const user = await User.findByEmail(req.user.email);
  if (!user) {
    return next(createError(404, 'User not found.'));
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return next(createError(401, 'Current password is incorrect.'));
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  await User.updatePassword(user.id, hashedPassword);

  return res.status(200).json({ message: 'Password updated successfully.' });
});
