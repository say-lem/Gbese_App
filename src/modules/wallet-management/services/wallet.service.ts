import { WalletModel } from '../models/wallet.model';
import { Types } from 'mongoose';

export class WalletService {
  static async getWalletByUserId(userId: string) {
    const wallet = await WalletModel.findOne({ userId });
    if (!wallet) throw new Error('Wallet not found');
    return wallet;
  }

  static async createWallet(userId: Types.ObjectId) {
    const existing = await WalletModel.findOne({ userId });
    if (existing) return existing;

    const newWallet = new WalletModel({ userId, tokenBalance: 0, fiatBalance: 0 });
    return newWallet.save();
  }

  static async updateTokenBalance(userId: string, amount: number) {
    const wallet = await WalletModel.findOne({ userId });
    if (!wallet) throw new Error('Wallet not found');
    wallet.tokenBalance += amount;
    return wallet.save();
  }

  static async updateFiatBalance(userId: string, amount: number) {
    const wallet = await WalletModel.findOne({ userId });
    if (!wallet) throw new Error('Wallet not found');
    wallet.fiatBalance += amount;
    return wallet.save();
  }
}
