import { NextFunction, Response } from "express";
import { TransactionService } from "../services/transaction.service";
import { AuthRequest } from "../../../middleware/auth.middleware";
import ApiError from "../../../utils/ApiError";
import LoanService from "../../credit-lending/services/loan.service";
import mongoose from "mongoose";
import { WalletService } from "../../wallet-management/services/wallet.service";
import { TransactionModel } from "../models/transaction.model";

export class TransactionController {

	// static async deposit(userId: string, amount: number, next: NextFunction) {
	// 	if (!userId || amount <= 0) {
	// 	  return next(new ApiError("Invalid deposit request", 400));
	// 	}
	  
	// 	const wallet = await WalletService.updateFiatBalance(userId, amount);
	  
	// 	const transaction = new TransactionModel({
	// 	  userId,
	// 	  transactionType: "deposit",
	// 	  amount,
	// 	  fiatChange: amount,
	// 	  status: "completed",
	// 	  timestamp: new Date(),
	// 	});
	  
	// 	return transaction.save();
	//   }
	  

	static async withdraw(req: AuthRequest, res: Response) {
		try {
			const { amount } = req.body;
			const tx = await TransactionService.withdraw(req.user?.userId!, amount);
			res.status(201).json(tx);
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}

	static async payDueLoan(req: AuthRequest, res: Response, next: NextFunction) {
		const session = await mongoose.startSession();
		try {
			const userId = req.user?.userId!;
			const { lenderId, loanId, amount } = req.body;
			const dueLoanTransaction = await session.withTransaction(async () => {
				const loanPayment = await LoanService.payDueLoan(
					userId,
					lenderId,
					amount,
					loanId,
					session
				);
				session.commitTransaction();
				return loanPayment;
			});

			res
				.status(200)
				.send({
					success: true,
					data: {
						reciept: dueLoanTransaction.UpdatedTx.senderTransaction,
						loan: dueLoanTransaction.UpdatedLoan,
					},
				});
		} catch (error) {
			if (session.inTransaction()) {
				session.abortTransaction();
			}
			if (error instanceof ApiError) {
				return next(new ApiError(error.message, error.statusCode));
			}
			return next(new ApiError("Internal Server Error", 500));
		} finally {
			session.endSession();
		}
	}

	static async history(req: AuthRequest, res: Response) {
		try {
			const txs = await TransactionService.getTransactionHistory(req.user?.userId!);
			res.json(txs);
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}
}
