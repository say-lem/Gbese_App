import ApiError from "../../../utils/ApiError";
import { WalletModel } from "../models/wallet.model";
import { ClientSession, Types } from "mongoose";

export class WalletService {
	static async getWalletByUserId(userId: string) {
		const wallet = await WalletModel.findOne({ userId });
		if (!wallet) throw new Error("Wallet not found");
		return wallet;
	}

	static async createWallet(userId: Types.ObjectId) {
		const existing = await WalletModel.findOne({ userId });
		if (existing) return existing;

		const newWallet = new WalletModel({
			userId,
			tokenBalance: 0,
			fiatBalance: 0,
		});
		return newWallet.save();
	}

	static async updateTokenBalance(userId: string, amount: number, session: ClientSession) {
		const checkWallet = await WalletModel.findOne({ userId }).session(session ?? null);
		if (!checkWallet) throw new ApiError("Wallet not found", 404);

    // Check if the amount is valid for deposit or withdrawal
		// For deposit, amount should be greater than or equal to 0
		// For withdrawal, amount should be less than or equal to the user's current balance
		// then Updates the user's token balance accordingly
		const updatedWallet = await WalletModel.findOneAndUpdate(
      { userId, tokenBalance: { $gte: amount <= 0 ? -amount : 0 } },
      { $inc: { tokenBalance: amount } },
      { new: true, session }
    );
    if (!updatedWallet) throw new ApiError("insufficient balance", 400);
    return updatedWallet;
	}

	static async updateFiatBalance(userId: string, amount: number, session?: ClientSession) {
		// Check if the user has a wallet
		const checkWallet = await WalletModel.findOne({ userId }).session(session ?? null);
		if (!checkWallet) throw new ApiError("Wallet not found", 404);

		// Check if the amount is valid for deposit or withdrawal
		// For deposit, amount should be greater than or equal to 0
		// For withdrawal, amount should be less than or equal to the user's current balance
		// then Updates the user's fiat balance accordingly
		const updatedWallet = await WalletModel.findOneAndUpdate(
			{ userId, fiatBalance: { $gte: amount <= 0 ? -amount : 0 } },
			{ $inc: { fiatBalance: amount } },
			{ new: true, session }
		);
		if (!updatedWallet) throw new ApiError("insufficient balance", 400);
		return updatedWallet;
	}
}
