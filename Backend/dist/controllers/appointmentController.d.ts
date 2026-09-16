import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const getAvailability: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMyAvailability: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateMyAvailability: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createAppointment: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMyAppointments: (req: AuthRequest, res: Response) => Promise<void>;
export declare const cancelAppointment: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getStaffAppointments: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=appointmentController.d.ts.map