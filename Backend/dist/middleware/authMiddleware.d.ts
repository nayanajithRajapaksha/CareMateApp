import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: any;
}
export declare const verifyToken: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireRole: (requiredRoles: string | string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireAnyRole: (allowedRoles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authMiddleware.d.ts.map