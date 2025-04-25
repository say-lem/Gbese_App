import { Request, Response } from 'express';
import { TransactionService } from '../services/transaction.service';
import { AuthRequest } from '../../../middleware/auth.middleware';

export class TransactionController {
  static async deposit(req: AuthRequest, res: Response) {
    try {
      const { amount } = req.body;
      const tx = await TransactionService.deposit(req.userId!, amount);
      res.status(201).json(tx);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async withdraw(req: AuthRequest, res: Response) {
    try {
      const { amount } = req.body;
      const tx = await TransactionService.withdraw(req.userId!, amount);
      res.status(201).json(tx);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async history(req: AuthRequest, res: Response) {
    try {
      const txs = await TransactionService.getTransactionHistory(req.userId!);
      res.json(txs);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
