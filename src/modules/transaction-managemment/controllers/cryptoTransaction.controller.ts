import { NextFunction, Response } from "express";
import { AuthRequest } from "../../../middleware/auth.middleware";
import mongoose, { isValidObjectId } from "mongoose";
import { CryptoTransactionService } from "../services/cryptoTransaction.service";

export class CryptoTransactionController {
  // POST
  static InternalTransfer = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { fromUserName, toUserName, amount, currency, transactionType } =
        req.body;

      if (
        !fromUserName ||
        !toUserName ||
        !amount ||
        !currency ||
        !transactionType
      ) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      if (!fromUserName || !toUserName) {
        res.status(400).json({ message: "Valid userNames are required" });
        return;
      }

      if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        res.status(400).json({ message: "Amount must be a positive number" });
        return;
      }

      const transactionId = await CryptoTransactionService.InternalTransfer(
        fromUserName,
        toUserName,
        amount,
        currency,
        transactionType
      );

      res.status(200).json({
        message: "System transfer successful",
        transactionId,
        fromUserName,
        toUserName,
        amount,
        currency,
      });
    } catch (error: any) {
      console.error("Error performing internal transfer:", error);
      res.status(500).json({
        message: "Failed to perform internal transfer",
        error: error.message,
      });
    }
  };

  // POST
  static externalTransfer = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { fromUserName, toAddress, amount, currency } = req.body;
      const { userId } = req;

      if (!fromUserName || !toAddress || !amount) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      if (!fromUserName) {
        res.status(400).json({ message: "Valid fromUserName is required" });
        return;
      }

      if (!/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
        res.status(400).json({ message: "Invalid Ethereum address" });
        return;
      }

      if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        res.status(400).json({ message: "Amount must be a positive number" });
        return;
      }

      const txHash = await CryptoTransactionService.externalTransfer(
        userId!,
        fromUserName,
        toAddress,
        amount,
        currency || "USDC"
      );

      res.status(200).json({
        message: "External transfer successful",
        txHash,
        fromUserName,
        toAddress,
        amount,
        currency: currency || "USDC",
      });
    } catch (error: any) {
      console.error("Error performing external transfer:", error);
      res.status(500).json({
        message: "Failed to perform external transfer",
        error: error.message,
      });
    }
  };

  // GET
  static async getUSDCBalance(req: AuthRequest, res: Response): Promise<void> {
    const { userId } = req;
    try {
      if (!isValidObjectId(userId)) {
        res.status(400).json({ message: "Valid userId is required" });
        return;
      }

      const balance = await CryptoTransactionService.getUSDCBalance(userId!);
      let usdcBalance = Number(balance);

      res.status(200).json({
        userId,
        usdcBalance,
        currency: "USDC",
      });
    } catch (error: any) {
      console.error("Error getting USDC balance:", error);
      res
        .status(500)
        .json({ message: "Failed to get USDC balance", error: error.message });
    }
  }

  // GET
  static getUserTokenBalances = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req;

      if (!isValidObjectId(userId)) {
        res.status(400).json({ message: "Valid userId is required" });
        return;
      }

      const balances = await CryptoTransactionService.getUserWalletBalance(
        userId!
      );

      res.status(200).json({
        userId,
        ...balances,
      });
    } catch (error: any) {
      console.error("Error getting user balance:", error);
      res
        .status(500)
        .json({ message: "Failed to get user balance", error: error.message });
    }
  };

  // GET
  static getTransactionHistory = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req;
      const { userName } = req.params

      if (!isValidObjectId(userId)) {
        res.status(400).json({ message: "Valid userId is required" });
        return;
      }

      const transactions =
        await CryptoTransactionService.getUserTransactionHistory(userName!);

      res.status(200).json({
        userName,
        transactionCount: transactions.length,
        transactions,
      });
    } catch (error: any) {
      console.error("Error getting transaction history:", error);
      res.status(500).json({
        message: "Failed to get transaction history",
        error: error.message,
      });
    }
  };

  // GET
  static getTransactionsByCurrency = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { currency } = req.params;
      const { userId } = req;

      if (!isValidObjectId(userId)) {
        res.status(400).json({ message: "Valid userId is required" });
        return;
      }

      if (!["USDC", "ETH", "GBESE"].includes(currency)) {
        res.status(400).json({ message: "Invalid currency" });
        return;
      }

      const transactions =
        await CryptoTransactionService.getTransactionsByCurrency(
          currency,
          userId!
        );

      res.status(200).json({
        currency,
        transactionCount: transactions.length,
        transactions,
      });
    } catch (error: any) {
      console.error("Error getting transactions by currency:", error);
      res
        .status(500)
        .json({ message: "Failed to get transactions", error: error.message });
    }
  };

  // DELETE
  static deleteTransaction = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { transactionId } = req.params;

      if (!isValidObjectId(transactionId)) {
        res.status(400).json({ message: "Valid transactionId is required" });
        return;
      }

      await CryptoTransactionService.deleteTransaction(transactionId);

      res.status(200).json({
        message: "Transaction deleted successfully",
        transactionId,
      });
    } catch (error: any) {
      console.error("Error deleting transaction:", error);
      res
        .status(500)
        .json({
          message: "Failed to delete transaction",
          error: error.message,
        });
    }
  };
}
