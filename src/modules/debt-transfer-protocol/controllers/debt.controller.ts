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
      }
      
    static async getUserDebtTransfers(req: Request, res: Response): Promise<any>  {
        const userId = req.params.userId;
      
        try {
          const transfers = await DebtTransferModel.find({
            $or: [{ fromUserId: userId }, { toUserId: userId }],
          });
      
          res.status(200).json({ data: transfers });
        } catch (error) {
          res.status(500).json({ message: 'Server error', error });
        }
      }
    
    static async postDebtTransferAd(req: Request, res: Response): Promise<any> {
        const { fromUserId, toUserId, amount } = req.body;

        if (!fromUserId || !toUserId || !amount) {
          return res.status(400).json({ message: 'Missing required fields' });
        }
      
        try {
          const newAd = new DebtTransferModel({ fromUserId, toUserId, amount });
          await newAd.save();
      
          res.status(201).json({ message: 'Debt ad created', data: newAd });
        } catch (error) {
          res.status(500).json({ message: 'Server error', error });
        }
    }
};