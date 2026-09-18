import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const getNotificationSettings: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateNotificationSettings: (req: AuthRequest, res: Response) => Promise<void>;
export declare const triggerReminders: (req: AuthRequest, res: Response) => Promise<void>;
export declare const triggerSingleReminder: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=notificationController.d.ts.map