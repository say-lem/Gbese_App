import mongoose, { Schema, Document,Types } from 'mongoose';
import { IUser } from '../../../common/interfaces/user';
import { NEW_USER_CREDIT_SCORE } from '../../../config/constants';

interface IUserDocument extends Omit<IUser, '_id'>, Document<Types.ObjectId> {}

const kycSchema = new Schema({
  bvn: String,
  nin: String,
  selfieURL: String,
  idType: String,
  idNumber: String
}, { _id: false });

const userSchema = new Schema<IUserDocument>({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: String,
  kycDetails: kycSchema,
  registrationDate: { type: Date, required: true, default: Date.now },
  baseCreditScore: { type: Number, default: NEW_USER_CREDIT_SCORE },
  deviceFingerprints: [String],
  ipAddresses: [String],
  walletAddress: {type: String, unique: true},
  usdcBalance: { type: Number, default: 0 },
  ethBalance: { type: Number, default: 0 },
  gbeseTokenBalance: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin', 'lender'], default: 'user' },
  isKYCVerified: { type: Boolean, default: false },
  loanToIncomeRatio: Number,
  isDeleted: { type: Boolean, default: false }
});

const UserModel = mongoose.model<IUserDocument>('User', userSchema);

export { UserModel, IUserDocument };

