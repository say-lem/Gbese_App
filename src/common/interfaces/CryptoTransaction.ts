import { Types } from "mongoose";

export interface ICryptoTransaction {
  cryptotransactionId?: Types.ObjectId;
  fromUserName: string;
  fromAddress: string
  toUserName: string;
  toAddress: string;
  amount: number;
  Direction: "INTERNAL" | "EXTERNAL";
  TransactionType: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "LOAN";
  timestamp: Date;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  currency: "USDC" | "ETH" | "GBESE";
  txHash?: string;
  isDeleted?: boolean;
}
