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
		try {
			// Perform wallet updates
			await WalletService.updateFiatBalance(userId, -amount);
			await WalletService.updateFiatBalance(recipientId, amount);

      const [sender, recipient] = await Promise.all([
        UserModel.findById(userId),
        UserModel.findById(recipientId),
      ]);

			// Create transactions for both parties
			const [senderTransaction, recipientTransaction] = await Promise.all([
				new TransactionModel({
					userId,
					transactionType,
					amount,
					fiatChange: -amount,
					status: "completed",
					details: { recipient: recipient?.username },
					timestamp: new Date(),
				}).save(),
				new TransactionModel({
					userId: recipientId,
					transactionType,
					amount,
					fiatChange: amount,
					status: "completed",
					details: { sender: sender?.username },
					timestamp: new Date(),
				}).save(),
			]);

			return [senderTransaction, recipientTransaction];
		} catch (error: unknown) {
	  
			// Rollback if anything fails
			await WalletService.updateFiatBalance(userId, amount);
			await WalletService.updateFiatBalance(recipientId, -amount);
			if (error instanceof Error) {
				throw new ApiError("Transfer failed: " + error.message, 500);
			}
			throw new ApiError("Transfer failed: Unknown error", 500);
		}
	}

	static async getTransactionHistory(userId: string) {
		return TransactionModel.find({ userId }).sort({ timestamp: -1 });
	}
}
