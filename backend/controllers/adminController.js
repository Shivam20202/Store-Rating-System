import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Store from '../models/Store.js';
import Rating from '../models/Rating.js';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
  validateRole,
  parsePagination,
  parseSort,
} from '../middleware/validate.js';
import { createError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * GET /api/admin/stats
 */
export const getStats = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.count({});
  const totalStores = await Store.count({});
  const totalRatings = await Rating.countAll();

  return res.status(200).json({
    totalUsers,
    totalStores,
    totalRatings,
  });
});

/**
 * GET /api/admin/users
 * List all users with filters, sorting, and pagination.
 */
export const getUsers = asyncHandler(async (req, res, next) => {
  const { name, email, address, role } = req.query;
  const { page, limit, offset } = parsePagination(req.query);
  const { sortBy, sortOrder } = parseSort(req.query, ['id', 'name', 'email', 'address', 'role', 'created_at'], 'id');

  const [users, total] = await Promise.all([
    User.getAll({ name, email, address, role, sortBy, sortOrder, page, limit }),
    User.count({ name, email, address, role }),
  ]);

  return res.status(200).json({
    data: users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * POST /api/admin/users
 * Admin can create a user of any role.
 */
export const createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, address, role } = req.body;

  // --- Validation ---
  const nameCheck = validateName(name);
  if (!nameCheck.valid) return next(createError(400, nameCheck.message));

  const emailCheck = validateEmail(email);
  if (!emailCheck.valid) return next(createError(400, emailCheck.message));

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) return next(createError(400, passwordCheck.message));

  const addressCheck = validateAddress(address);
  if (!addressCheck.valid) return next(createError(400, addressCheck.message));

  const roleCheck = validateRole(role);
  if (!roleCheck.valid) return next(createError(400, roleCheck.message));

  // --- Duplicate email check ---
  const existing = await User.findByEmail(email.trim().toLowerCase());
  if (existing) {
    return next(createError(409, 'A user with this email already exists.'));
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const userId = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    address: address.trim(),
    role,
  });

  return res.status(201).json({
    message: 'User created successfully.',
    user: { id: userId, name: name.trim(), email: email.trim().toLowerCase(), role },
  });
});

/**
 * GET /api/admin/users/:id
 * User detail. If the user is a store_owner, include their store's average rating.
 */
export const getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = parseInt(id, 10);
  if (Number.isNaN(userId)) {
    return next(createError(400, 'Invalid user id.'));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(createError(404, 'User not found.'));
  }

  const response = { ...user };

  if (user.role === 'store_owner') {
    const store = await Store.findByOwnerId(user.id);
    if (store) {
      const { avgRating, totalRatings } = await Store.getAvgRating(store.id);
      response.store = {
        ...store,
        avg_rating: avgRating,
        total_ratings: totalRatings,
      };
    }
  }

  return res.status(200).json({ data: response });
});

/**
 * GET /api/admin/stores
 * List all stores with filters, sorting, and pagination.
 */
export const getStores = asyncHandler(async (req, res, next) => {
  const { name, email, address } = req.query;
  const { page, limit, offset } = parsePagination(req.query);
  const { sortBy, sortOrder } = parseSort(req.query, ['id', 'name', 'email', 'address', 'created_at', 'avg_rating'], 'id');

  const [stores, total] = await Promise.all([
    Store.getAll({ name, email, address, sortBy, sortOrder, page, limit }),
    Store.count({ name, email, address }),
  ]);

  return res.status(200).json({
    data: stores,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * POST /api/admin/stores
 * Create a store with a given owner_id.
 */
export const createStore = asyncHandler(async (req, res, next) => {
  const { name, email, address, owner_id } = req.body;

  // --- Validation ---
  const nameCheck = validateName(name);
  if (!nameCheck.valid) return next(createError(400, nameCheck.message));

  const emailCheck = validateEmail(email);
  if (!emailCheck.valid) return next(createError(400, emailCheck.message));

  const addressCheck = validateAddress(address);
  if (!addressCheck.valid) return next(createError(400, addressCheck.message));

  const ownerId = parseInt(owner_id, 10);
  if (Number.isNaN(ownerId) || ownerId <= 0) {
    return next(createError(400, 'A valid owner_id is required.'));
  }

  // --- Owner must exist and be a store_owner ---
  const owner = await User.findById(ownerId);
  if (!owner) {
    return next(createError(404, 'Owner user not found.'));
  }
  if (owner.role !== 'store_owner') {
    return next(createError(400, 'The selected owner must have the store_owner role.'));
  }

  // --- Prevent a store_owner from owning multiple stores ---
  const existingStore = await Store.findByOwnerId(ownerId);
  if (existingStore) {
    return next(createError(409, 'This store owner already has a store.'));
  }

  const storeId = await Store.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    address: address.trim(),
    owner_id: ownerId,
  });

  return res.status(201).json({
    message: 'Store created successfully.',
    store: {
      id: storeId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      owner_id: ownerId,
    },
  });
});
