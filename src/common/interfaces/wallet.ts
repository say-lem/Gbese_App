import { Types } from 'mongoose';

export interface IWallet {
  walletId?: Types.ObjectId;
  userId: Types.ObjectId;
  tokenUSDBalance: number;
  fiatBalance: number; 
  isDeleted?: boolean;
}

export interface IWalletResponse {
  userId: string;
  tokenUSDBalance: number;
  fiatBalance: number;
}

