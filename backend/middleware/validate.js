/**
 * Validation helpers used across controllers and middleware.
 * Each helper returns an object: { valid: boolean, message?: string }
 */

// Name: 20-60 characters
export const validateName = (name) => {
  if (typeof name !== 'string') {
    return { valid: false, message: 'Name is required.' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 20) {
    return { valid: false, message: 'Name must be at least 20 characters long.' };
  }
  if (trimmed.length > 60) {
    return { valid: false, message: 'Name must be at most 60 characters long.' };
  }
  return { valid: true };
};

// Email: standard email format
export const validateEmail = (email) => {
  if (typeof email !== 'string' || !email.trim()) {
    return { valid: false, message: 'Email is required.' };
  }
  // RFC-ish pragmatic email regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, message: 'Please provide a valid email address.' };
  }
  return { valid: true };
};

// Password: 8-16 chars, at least one uppercase, at least one special char
export const validatePassword = (password) => {
  if (typeof password !== 'string' || !password) {
    return { valid: false, message: 'Password is required.' };
  }
  if (password.length < 8 || password.length > 16) {
    return { valid: false, message: 'Password must be between 8 and 16 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  // At least one special character (anything not alphanumeric)
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character.' };
  }
  return { valid: true };
};

// Address: max 400 characters
export const validateAddress = (address) => {
  if (typeof address !== 'string' || !address.trim()) {
    return { valid: false, message: 'Address is required.' };
  }
  if (address.trim().length > 400) {
    return { valid: false, message: 'Address must be at most 400 characters long.' };
  }
  return { valid: true };
};

// Rating: integer 1-5
export const validateRating = (rating) => {
  if (rating === undefined || rating === null) {
    return { valid: false, message: 'Rating is required.' };
  }
  const num = Number(rating);
  if (!Number.isInteger(num)) {
    return { valid: false, message: 'Rating must be an integer between 1 and 5.' };
  }
  if (num < 1 || num > 5) {
    return { valid: false, message: 'Rating must be between 1 and 5.' };
  }
  return { valid: true };
};

// Role: must be one of the allowed enum values
export const validateRole = (role) => {
  const allowed = ['admin', 'user', 'store_owner'];
  if (!role) {
    return { valid: false, message: 'Role is required.' };
  }
  if (!allowed.includes(role)) {
    return { valid: false, message: 'Role must be one of: admin, user, store_owner.' };
  }
  return { valid: true };
};

// Pagination helper: parses page/limit from query, returns sane defaults
export const parsePagination = (query) => {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);
  if (!page || page < 1) page = 1;
  if (!limit || limit < 1) page = page; // ensure page stays valid
  if (!limit || limit < 1) limit = 10;
  if (limit > 100) limit = 100; // cap to avoid huge queries
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

// Sort helper: validates sortBy against a whitelist and forces ASC/DESC
export const parseSort = (query, allowedFields, defaultField) => {
  const sortBy = (query.sortBy || defaultField).toLowerCase();
  const sortOrder = (query.sortOrder || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  if (!allowedFields.includes(sortBy)) {
    return { sortBy: defaultField, sortOrder: 'ASC' };
  }
  return { sortBy, sortOrder };
};
