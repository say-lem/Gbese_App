import mongoose, { Schema, Document, Types } from 'mongoose';
import { IWallet } from '../../../common/interfaces/wallet';

interface IWalletDocument extends Omit<IWallet, 'walletId'>, Document<Types.ObjectId> {}

const walletSchema = new Schema<IWalletDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  tokenUSDBalance: { type: Number, required: true, default: 0 },
  fiatBalance: { type: Number, required: true, default: 0 },
  isDeleted: { type: Boolean, default: false }
});

const WalletModel = mongoose.model<IWalletDocument>('Wallet', walletSchema);

export { WalletModel, IWalletDocument };
