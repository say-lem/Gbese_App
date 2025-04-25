import { TransactionModel } from '../models/transaction.model';
import { WalletService } from '../../wallet-management/services/wallet.service';

export class TransactionService {
  static async deposit(userId: string, amount: number) {
    const wallet = await WalletService.updateFiatBalance(userId, amount);

    const transaction = new TransactionModel({
      userId,
      transactionType: 'deposit',
      amount,
      fiatChange: amount,
      status: 'completed',
      timestamp: new Date()
    });

    return transaction.save();
  }

  static async withdraw(userId: string, amount: number) {
    const wallet = await WalletService.getWalletByUserId(userId);
    if (wallet.fiatBalance < amount) throw new Error('Insufficient balance');

    await WalletService.updateFiatBalance(userId, -amount);

    const transaction = new TransactionModel({
      userId,
      transactionType: 'withdrawal',
      amount,
      fiatChange: -amount,
      status: 'completed',
      timestamp: new Date()
    });

    return transaction.save();
  }

  static async getTransactionHistory(userId: string) {
    return TransactionModel.find({ userId }).sort({ timestamp: -1 });
  }
}
