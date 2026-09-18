import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const getAllClinics: (_req: Request, res: Response) => Promise<void>;
export declare const createClinic: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateClinic: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteClinic: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getSpecialists: (req: Request, res: Response) => Promise<void>;
export declare const createSpecialist: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateSpecialist: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteSpecialist: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=clinicController.d.ts.map