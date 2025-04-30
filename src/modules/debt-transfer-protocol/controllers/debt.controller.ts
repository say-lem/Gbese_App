import { Request, Response } from 'express';
import { DebtTransferModel } from '../models/debt.model';
import { AuthRequest } from '../../../middleware/auth.middleware';

export class DebtController {
    static async getUserDebtTransfers(req: Request, res: Response): Promise<any>  {
        const userId = req.params.userId; // from route param
      
        try {
          const transfers = await DebtTransferModel.find({
            $or: [{ fromUserId: userId }, { toUserId: userId }],
          });
      
          res.status(200).json({ data: transfers });
        } catch (error) {
          res.status(500).json({ message: 'Server error', error });
        }
      }}