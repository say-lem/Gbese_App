import mongoose, { Schema, Document, Types } from 'mongoose';
import { ITransaction } from '../../../common/interfaces/transaction';

interface ITransactionDocument extends Omit<ITransaction, 'transactionId'>, Document<Types.ObjectId> {}

const transactionSchema = new Schema<ITransactionDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  transactionType: { type: String, required: true, enum: ['deposit', 'withdrawal', 'transfer', 'loan'] },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  details: { type: Schema.Types.Mixed },
  fiatChange: { type: Number },
  tokenChange: { type: Number },
  isDeleted: { type: Boolean, default: false }
});

const TransactionModel = mongoose.model<ITransactionDocument>('Transaction', transactionSchema);

export { TransactionModel, ITransactionDocument };
