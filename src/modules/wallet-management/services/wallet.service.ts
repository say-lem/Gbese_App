import ApiError from "../../../utils/ApiError";
import { WalletModel } from "../models/wallet.model";
import { ClientSession, Types } from "mongoose";

export class WalletService {
  static async getWalletByUserId(userId: string) {
    const wallet = await WalletModel.findOne({ userId });
    if (!wallet) throw new Error("Wallet not found");
    return wallet;
  }

  static async createWallet(userId: string) {
    const objectId = new Types.ObjectId(userId);
    const existing = await WalletModel.findOne({ userId: objectId });
    if (existing) return existing;
  
    const newWallet = new WalletModel({
      userId: objectId,
      tokenUSDBalance: 0,
      fiatBalance: 0,
    });
    return newWallet.save();
  }

  static async updateTokenUSDBalance(userId: string, amount: number, session: ClientSession) {
    const checkWallet = await WalletModel.findOne({ userId }).session(session ?? null);
    if (!checkWallet) throw new ApiError("Wallet not found", 404);

    // For deposit, amount should be greater than or equal to 0
    // For withdrawal, amount should be less than or equal to the user's current balance
    const updatedWallet = await WalletModel.findOneAndUpdate(
      { userId, tokenUSDBalance: { $gte: amount <= 0 ? -amount : 0 } },
      { $inc: { tokenUSDBalance: amount } },
      { new: true, session }
    );
    if (!updatedWallet) throw new ApiError("insufficient balance", 400);
    return updatedWallet;
  }

  static async updateFiatBalance(userId: string, amount: number, session?: ClientSession) {
    const checkWallet = await WalletModel.findOne({ userId }).session(session ?? null);
    if (!checkWallet) throw new ApiError("Wallet not found", 404);

    // For deposit, amount should be greater than or equal to 0
    // For withdrawal, amount should be less than or equal to the user's current balance
    const updatedWallet = await WalletModel.findOneAndUpdate(
      { userId, fiatBalance: { $gte: amount <= 0 ? -amount : 0 } },
      { $inc: { fiatBalance: amount } },
      { new: true, session }
    );
    if (!updatedWallet) throw new ApiError("insufficient balance", 400);
    return updatedWallet;
  }
}
