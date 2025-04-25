import { Types } from 'mongoose';

export interface ITransaction {
  transactionId?: Types.ObjectId;
  userId: Types.ObjectId;
  transactionType: 'deposit' | 'withdrawal' | 'transfer' | 'loan';
  amount: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  details?: object;
  fiatChange?: number;
  tokenChange?: number;
  isDeleted?: boolean;
}
