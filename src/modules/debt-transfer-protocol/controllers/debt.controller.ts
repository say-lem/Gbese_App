import { Request, Response } from 'express';
import { DebtTransferModel } from '../models/debt.model';
import { AuthRequest } from '../../../middleware/auth.middleware';

export class DebtController {
    static async getAllDebtTransfers(req: Request, res: Response): Promise<any> {
    try {
      const transfers = await DebtTransferModel.find();
      res.status(200).json({ data: transfers });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

}