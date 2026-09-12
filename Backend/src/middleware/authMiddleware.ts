import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Normalizes role names so phm and midwife map to the same permission set
 */
const normalizeRole = (role: string): string => {
  const lower = role.toLowerCase();
  if (lower === 'phm' || lower === 'midwife') return 'midwife';
  return lower;
};

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

export const requireRole = (requiredRoles: string | string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(403).json({ error: 'Access denied. Role information missing.' });
      return;
    }

    const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    const userRole = normalizeRole(req.user.role);

    if (!allowedRoles.some(role => normalizeRole(role) === userRole)) {
      res.status(403).json({ error: `Access denied. Requires one of: ${allowedRoles.join(', ')}.` });
      return;
    }

    next();
  };
};

export const requireAnyRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(403).json({ error: 'Access denied. Role information missing.' });
      return;
    }

    const normalizedUserRole = normalizeRole(req.user.role);
    const normalizedAllowed = allowedRoles.map(r => normalizeRole(r));

    if (!normalizedAllowed.includes(normalizedUserRole)) {
      res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      return;
    }

    next();
  };
};
