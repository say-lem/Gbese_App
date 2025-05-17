import { Request, Response, NextFunction } from 'express';
import { DebtTransferService } from '../services/debtTransfer.service';
import ApiError from '../../../utils/ApiError';
import { AuthRequest } from '../../../middleware/auth.middleware';

export class DebtTransferController {
  // Upload a loan to the public marketplace
  static async uploadToMarketplace(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { loanId } = req.body;

      if (!loanId) throw new ApiError('Loan ID is required', 400);

      const result = await DebtTransferService.uploadToMarketplace(userId!, loanId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  // Get all marketplace loans
  static async getMarketplaceLoans(_req: Request, res: Response, next: NextFunction) {
    try {
      const loans = await DebtTransferService.getMarketplaceLoans();
      res.status(200).json(loans);
    } catch (err) {
      next(err);
    }
  }

  // Initiate a direct transfer
  static async initiateDirectTransfer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const currentHolderId = req.user?.userId;
      const { loanId, newUserId } = req.body;

      if (!loanId || !newUserId) throw new ApiError('Loan ID and new user ID are required', 400);

      const result = await DebtTransferService.initiateDirectTransfer(currentHolderId!, loanId, newUserId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  // Accept a transfer
  static async acceptDebtTransfer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const newUserId = req.user?.userId;
      const { loanId, repayImmediately = false } = req.body;

      if (!loanId) throw new ApiError('Loan ID is required', 400);

      const result = await DebtTransferService.acceptDebtTransfer(newUserId!, loanId, repayImmediately);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  // Decline a transfer
  static async declineDebtTransfer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const newUserId = req.user?.userId;
      const { loanId } = req.body;

      if (!loanId) throw new ApiError('Loan ID is required', 400);

      const result = await DebtTransferService.declineDebtTransfer(newUserId!, loanId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  // Withdraw loan from marketplace
  static async withdrawFromMarketplace(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { loanId } = req.body;

      if (!loanId) throw new ApiError('Loan ID is required', 400);

      const result = await DebtTransferService.withdrawFromMarketplace(userId!, loanId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
