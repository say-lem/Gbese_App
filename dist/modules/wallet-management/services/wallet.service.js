"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const wallet_model_1 = require("../models/wallet.model");
class WalletService {
    static async getWalletByUserId(userId) {
        const wallet = await wallet_model_1.WalletModel.findOne({ userId });
        if (!wallet)
            throw new Error('Wallet not found');
        return wallet;
    }
    static async createWallet(userId) {
        const existing = await wallet_model_1.WalletModel.findOne({ userId });
        if (existing)
            return existing;
        const newWallet = new wallet_model_1.WalletModel({ userId, tokenBalance: 0, fiatBalance: 0 });
        return newWallet.save();
    }
    static async updateTokenBalance(userId, amount) {
        const wallet = await wallet_model_1.WalletModel.findOne({ userId });
        if (!wallet)
            throw new Error('Wallet not found');
        wallet.tokenBalance += amount;
        return wallet.save();
    }
    static async updateFiatBalance(userId, amount) {
        const wallet = await wallet_model_1.WalletModel.findOne({ userId });
        if (!wallet)
            throw new Error('Wallet not found');
        wallet.fiatBalance += amount;
        return wallet.save();
    }
}
exports.WalletService = WalletService;
//# sourceMappingURL=wallet.service.js.map