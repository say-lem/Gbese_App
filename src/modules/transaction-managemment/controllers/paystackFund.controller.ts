import { PaystackService } from '../services/paystack.service';
import { NextFunction, Response } from "express";
import { UserModel } from '../../user-management/Models/user.model';
import { AuthRequest } from "../../../middleware/auth.middleware";
import ApiError from '../../../utils/ApiError';
import { TransactionService } from '../services/transaction.service';
import { FRONTEND_URL } from '../../../config/constants';

export class FundController {
    static async initiateFunding(req: AuthRequest, res: Response, next: NextFunction) {
      try {
        const { amount } = req.body;
  
        if (!amount || amount <= 0) {
          return next(new ApiError('Invalid amount', 400));
        }
  
        if (!req.user?.email) {
            return next(new ApiError('Email not found in token payload', 400));
          }
          const email = req.user.email;
          
        const callback_url = `${FRONTEND_URL}/payment/callback`; 
  
        const paystackRes = await PaystackService.initializeTransaction({
          email,
          amount: amount * 100, // Convert ₦ to kobo
          callback_url,
        });
  
        res.status(200).json({
          message: 'Transaction initialized',
          paymentLink: paystackRes.authorization_url,
          reference: paystackRes.reference,
        });
      } catch (error: any) {
        return next(new ApiError(error.message, 404));
      }
    }
  
    static async verifyFunding(req: AuthRequest, res: Response, next: NextFunction) {
        try {
          const { reference } = req.body;
      
          const transaction = await PaystackService.verifyTransaction(reference);
      
          if (transaction.status !== 'success') {
            return next(new ApiError('Transaction not successful', 400));
          }
      
          const amountFundedInNaira = transaction.amount / 100;
      
          if (!req.user?.userId) {
            return next(new ApiError('User ID not found in token payload', 400));
          }
      
          const userId = req.user.userId;
      
          const user = await UserModel.findById(userId);
          if (!user) return next(new ApiError('User not found', 404));
      
          user.fiatBalance = (user.fiatBalance!) + amountFundedInNaira;
          await user.save();
      
          await TransactionService.deposit(userId, amountFundedInNaira);
      
          res.status(200).json({
            message: 'Wallet funded successfully',
            newBalance: user.fiatBalance,
          });
        } catch (error: any) {
          return next(new ApiError(error.message, 404));
        }
      }
      
}
