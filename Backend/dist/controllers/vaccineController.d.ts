import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const getVaccines: (req: AuthRequest, res: Response) => Promise<void>;
export declare const addVaccine: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getChildVaccinations: (req: AuthRequest, res: Response) => Promise<void>;
export declare const markVaccineAdministered: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateVaccine: (req: AuthRequest, res: Response) => Promise<void>;
export declare const removeVaccineRecord: (req: AuthRequest, res: Response) => Promise<void>;
export declare const sendOverdueWarning: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteVaccine: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteVaccineGroup: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateVaccineGroup: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=vaccineController.d.ts.map