import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const registerChild: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getChildren: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateChild: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllChildrenController: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=childrenController.d.ts.map