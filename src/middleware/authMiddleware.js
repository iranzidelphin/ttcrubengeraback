import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export function extractBearerToken(authHeader = '') {
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.split(' ')[1];
}

export async function protect(req, res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization || '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token is required.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token.',
    });
  }
}

export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to perform this action.',
      });
    }

    next();
  };
}
