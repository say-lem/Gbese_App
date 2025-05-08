"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const transaction_model_1 = require("../models/transaction.model");
const wallet_service_1 = require("../../wallet-management/services/wallet.service");
class TransactionService {
    static async deposit(userId, amount) {
        const wallet = await wallet_service_1.WalletService.updateFiatBalance(userId, amount);
        const transaction = new transaction_model_1.TransactionModel({
            userId,
            transactionType: 'deposit',
            amount,
            fiatChange: amount,
            status: 'completed',
            timestamp: new Date()
        });
        return transaction.save();
    }
    static async withdraw(userId, amount) {
        const wallet = await wallet_service_1.WalletService.getWalletByUserId(userId);
        if (wallet.fiatBalance < amount)
            throw new Error('Insufficient balance');
        await wallet_service_1.WalletService.updateFiatBalance(userId, -amount);
        const transaction = new transaction_model_1.TransactionModel({
            userId,
            transactionType: 'withdrawal',
            amount,
            fiatChange: -amount,
            status: 'completed',
            timestamp: new Date()
        });
        return transaction.save();
    }
    static async getTransactionHistory(userId) {
        return transaction_model_1.TransactionModel.find({ userId }).sort({ timestamp: -1 });
    }
}
exports.TransactionService = TransactionService;
//# sourceMappingURL=transaction.service.js.map