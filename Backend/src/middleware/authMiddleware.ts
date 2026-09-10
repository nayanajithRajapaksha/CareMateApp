import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Extend the Express Request type to include the decoded user information
export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware to verify if the user has a valid JWT token.
 * This should be used on all protected routes.
 */
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach the decoded token payload to the request object
    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

/**
 * Middleware factory to check if the user has a specific role.
 * Example usage: router.get('/admin-dashboard', verifyToken, requireRole('admin'), controllerFunc)
 * 
 * @param requiredRole The role string required (e.g., 'parent', 'phm', 'admin')
 */
export const requireRole = (requiredRole: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Ensure verifyToken has already run and attached req.user
    if (!req.user || !req.user.role) {
      res.status(403).json({ error: 'Access denied. Role information missing.' });
      return;
    }

    if (req.user.role.toLowerCase() !== requiredRole.toLowerCase()) {
      res.status(403).json({ error: `Access denied. Requires '${requiredRole}' role.` });
      return;
    }

    next();
  };
};

/**
 * Middleware factory to check if the user has one of multiple allowed roles.
 * Example usage: router.get('/data', verifyToken, requireAnyRole(['admin', 'phm']), controllerFunc)
 * 
 * @param allowedRoles Array of role strings
 */
export const requireAnyRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(403).json({ error: 'Access denied. Role information missing.' });
      return;
    }

    const allowedLower = allowedRoles.map(r => r.toLowerCase());
    if (!allowedLower.includes(req.user.role.toLowerCase())) {
      res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      return;
    }

    next();
  };
};
