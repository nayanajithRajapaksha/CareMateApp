"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAnyRole = exports.requireRole = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
/**
 * Normalizes role names so phm and midwife map to the same permission set
 */
const normalizeRole = (role) => {
    const lower = role.toLowerCase();
    if (lower === 'phm' || lower === 'midwife')
        return 'midwife';
    return lower;
};
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Access denied. No token provided.' });
        return;
    }
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
        res.status(401).json({ error: 'Access denied. Token is missing.' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
};
exports.verifyToken = verifyToken;
const requireRole = (requiredRoles) => {
    return (req, res, next) => {
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
exports.requireRole = requireRole;
const requireAnyRole = (allowedRoles) => {
    return (req, res, next) => {
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
exports.requireAnyRole = requireAnyRole;
//# sourceMappingURL=authMiddleware.js.map