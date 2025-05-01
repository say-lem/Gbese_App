import { TransactionModel } from "../models/transaction.model";
import { WalletService } from "../../wallet-management/services/wallet.service";
import ApiError from "../../../utils/ApiError";
import { UserModel } from "../../user-management/Models";

export class TransactionService {
	static async deposit(userId: string, amount: number) {
		const wallet = await WalletService.updateFiatBalance(userId, amount);

		const transaction = new TransactionModel({
			userId,
			transactionType: "deposit",
			amount,
			fiatChange: amount,
			status: "completed",
			timestamp: new Date(),
		});

		return transaction.save();
	}

	static async withdraw(userId: string, amount: number) {
		const wallet = await WalletService.getWalletByUserId(userId);
		if (wallet.fiatBalance < amount) throw new Error("Insufficient balance");

		await WalletService.updateFiatBalance(userId, -amount);

		const transaction = new TransactionModel({
			userId,
			transactionType: "withdrawal",
			amount,
			fiatChange: -amount,
			status: "completed",
			timestamp: new Date(),
		});

		return transaction.save();
	}

	static async transfer(
		userId: string,
		recipientId: string,
		amount: number,
		transactionType: string
	) {
		const session = await TransactionModel.db.startSession();

		try {
			const transacton = await session.withTransaction(async () => {
				// Get both users first to verify they exist
				const sender = await UserModel.findById(userId).session(session);
				const recipient = await UserModel.findById(recipientId).session(
					session
				);

				if (!sender || !recipient) {
					throw new ApiError("Sender or recipient not found", 404);
				}

				// Update both wallets within the transaction
				await WalletService.updateFiatBalance(userId, -amount, session);
				await WalletService.updateFiatBalance(recipientId, amount, session);

				// Create transactions for both parties
				const senderTransaction = new TransactionModel({
					userId,
					transactionType,
					amount,
					fiatChange: -amount,
					status: "completed",
					details: { recipient: recipient.username },
					timestamp: new Date(),
				}).save({ session });
				const recipientTransaction = await new TransactionModel({
					userId: recipientId,
					transactionType,
					amount,
					fiatChange: amount,
					status: "completed",
					details: { sender: sender.username },
					timestamp: new Date(),
				}).save({ session });
				session.commitTransaction();
				return { senderTransaction, recipientTransaction };
			});
			
			return transacton;
		} catch (error: unknown) {
			session.abortTransaction();
			if (error instanceof Error) {
				throw new ApiError("Transfer failed: " + error.message, 500);
			}
			throw new ApiError("Transfer failed: Unknown error", 500);
		} finally {
			await session.endSession();
		}
	}

	static async getTransactionHistory(userId: string) {
		return TransactionModel.find({ userId }).sort({ timestamp: -1 });
	}
}
