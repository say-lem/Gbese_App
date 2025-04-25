import { Types } from 'mongoose';

export interface IWallet {
  walletId?: Types.ObjectId;
  userId: Types.ObjectId;
  tokenBalance: number;
  fiatBalance: number; 
  isDeleted?: boolean;
}

export interface IWalletResponse {
  userId: string;
  tokenBalance: number;
  fiatBalance: number;
}

