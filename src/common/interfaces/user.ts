import { IKYCMetadata } from "./KYC";
import { Types } from 'mongoose';

export interface IUser {
    _id?: Types.ObjectId;
  userId?: string;
  username: string;
  passwordHash: string;
  email: string;
  phoneNumber?: string;
  kycDetails?: IKYCMetadata;
  registrationDate: Date;
  baseCreditScore?: number;
  deviceFingerprints?: string[];
  ipAddresses?: string[];
  walletAddress: string;
  gbeseTokenBalance?: number;
  role: "user" | "admin" | "lender";
  isKYCVerified: boolean;
  loanToIncomeRatio?: number;
  isDeleted?: boolean;
}

export interface IUserResponse {
  userId: string;
  username: string;
  email: string;
  phoneNumber?: string;
  registrationDate: Date;
  baseCreditScore?: number;
  walletAddress: string;
  gbeseTokenBalance?: number;
  role: "user" | "admin" | "lender";
  isKYCVerified: boolean;
}
