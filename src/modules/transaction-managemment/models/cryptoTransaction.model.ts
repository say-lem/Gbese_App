import mongoose, { Schema, Document, Types } from "mongoose";
import { ICryptoTransaction } from "../../../common/interfaces/CryptoTransaction";

interface ICryptoTransactionDocument
  extends Omit<ICryptoTransaction, "cryptotransactionId">,
    Document<Types.ObjectId> {}
const cryptoTransactionSchema = new Schema<ICryptoTransactionDocument>({
  fromUserName: { type: String, ref: "User", required: false },
  fromAddress: { type: String, required: false },
  toAddress: { type: String, required: false },
  toUserName: { type: String, ref: "User", required: true },
  Direction: { type: String, required: true, enum: ["INTERNAL", "EXTERNAL"] },
  TransactionType: {
    type: String,
    required: true,
    enum: ["DEPOSIT", "WITHDRAWAL", "TRANSFER", "LOAN"],
  },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["PENDING", "CONFIRMED", "FAILED"],
    default: "PENDING",
  },
  currency: { type: String, enum: ["USDC", "ETH", "GBESE"], required: true },
  txHash: { type: String },
  isDeleted: { type: Boolean, default: false },
});

const cryptoTransactionModel = mongoose.model<ICryptoTransactionDocument>(
  "CryptoTransaction",
  cryptoTransactionSchema
);
export { cryptoTransactionModel, ICryptoTransactionDocument };
