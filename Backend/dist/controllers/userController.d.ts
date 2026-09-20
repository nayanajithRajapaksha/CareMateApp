import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const getProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllUsers: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updatePushToken: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUserNotifications: (req: AuthRequest, res: Response) => Promise<void>;
export declare const markNotificationAsRead: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=userController.d.ts.map