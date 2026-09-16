import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const getUnassignedPHMs: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAssignedPHMs: (req: AuthRequest, res: Response) => Promise<void>;
export declare const assignHospital: (req: AuthRequest, res: Response) => Promise<void>;
export declare const unassignHospital: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createPHMByMOH: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getParents: (req: AuthRequest, res: Response) => Promise<void>;
export declare const assignParentHospital: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=staffController.d.ts.map