"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const transaction_service_1 = require("../services/transaction.service");
class TransactionController {
    static async deposit(req, res) {
        try {
            const { amount } = req.body;
            const tx = await transaction_service_1.TransactionService.deposit(req.userId, amount);
            res.status(201).json(tx);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async withdraw(req, res) {
        try {
            const { amount } = req.body;
            const tx = await transaction_service_1.TransactionService.withdraw(req.userId, amount);
            res.status(201).json(tx);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async history(req, res) {
        try {
            const txs = await transaction_service_1.TransactionService.getTransactionHistory(req.userId);
            res.json(txs);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.TransactionController = TransactionController;
//# sourceMappingURL=transaction.controller.js.map