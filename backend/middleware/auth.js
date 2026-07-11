import jwt from 'jsonwebtoken';

/**
 * Verifies the Bearer token in the Authorization header and attaches
 * the decoded payload to req.user.
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  // Accept "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Authentication required. Provide a valid Bearer token.' });
  }

  const token = parts[1];
  if (!token) {
    return res.status(401).json({ message: 'Authentication token is missing.' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not configured in environment variables.');
    return res.status(500).json({ message: 'Server authentication configuration error.' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { id, name, email, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid or malformed token.' });
  }
};

/**
 * Returns middleware that allows access only to users whose role is in
 * the supplied list.
 *
 * Usage: router.get('/stats', verifyToken, requireRole('admin'), handler)
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};
