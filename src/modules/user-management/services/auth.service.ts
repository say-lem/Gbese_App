import bcrypt from "bcryptjs";
import { UserModel, IUserDocument } from "../Models";
import { IUserResponse } from "../../../common/interfaces/user";
import { WalletService } from "../../wallet-management/services/wallet.service";
import ApiError from "../../../utils/ApiError";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../utils/auth.utils";
import { CryptoTransactionService } from "../../transaction-managemment/services/cryptoTransaction.service";
import CreditScoreRepository from "../../reputation-credit-scoring/data-access/credit-score.repository";
import { generateOTP, otpExpiresIn } from '../../../utils/otp.utils';
import { sendVerificationEmail } from '../../../utils/email.utils';
import PendingUserModel from '../Models/pendingUser.model';

export class AuthService {

  static async initiateRegistration(userData: {
    username: string;
    password: string;
    email: string;
    phoneNumber?: string;
  }) {
    const { username, password, email, phoneNumber } = userData;
  
    const existing = await UserModel.findOne({ $or: [{ username }, { email }] });
    const pending = await PendingUserModel.findOne({ email });
  
    if (existing || pending) throw new ApiError('Email or username already exists', 409);
  
    const otp = generateOTP();
    const expiresAt = otpExpiresIn();
    const passwordHash = await bcrypt.hash(password, 10);
  
    await PendingUserModel.create({
      username,
      email,
      phoneNumber,
      passwordHash,
      otp,
      expiresAt
    });
  
    await sendVerificationEmail(email, otp);
  }
  
  static async verifyEmailAndCreateUser(email: string, otp: string) {
    const pending = await PendingUserModel.findOne({ email });
    if (!pending) throw new ApiError('No pending registration found', 404);
  
    if (pending.otp !== otp || pending.expiresAt < new Date()) {
      throw new ApiError('Invalid or expired OTP', 400);
    }
  
    const newUser = new UserModel({
      username: pending.username,
      passwordHash: pending.passwordHash,
      email: pending.email,
      phoneNumber: pending.phoneNumber,
      registrationDate: new Date(),
      isKYCVerified: false,
      isEmailVerified: true,
      role: 'user'
    });
  
    const walletAddress = await CryptoTransactionService.generateWalletForUser(newUser._id.toString());
    newUser.walletAddress = walletAddress.address;
  
    const savedUser = await newUser.save();
    await WalletService.createWallet(savedUser._id);
    await CreditScoreRepository.createCreditScore({
      userId: savedUser._id,
      score: savedUser.baseCreditScore,
      history: []
    });
  
    await PendingUserModel.deleteOne({ email });
  
    const accessToken = generateAccessToken(savedUser._id.toString());
    const refreshToken = generateRefreshToken(savedUser._id.toString());
  
    const userResponse: IUserResponse = {
      userId: savedUser._id.toString(),
      username: savedUser.username,
      email: savedUser.email,
      phoneNumber: savedUser.phoneNumber,
      registrationDate: savedUser.registrationDate,
      baseCreditScore: savedUser.baseCreditScore,
      walletAddress: savedUser.walletAddress,
      usdcBalance: savedUser.usdcBalance,
      ethBalance: savedUser.ethBalance,
      gbeseTokenBalance: savedUser.gbeseTokenBalance,
      role: savedUser.role,
      isKYCVerified: savedUser.isKYCVerified,
      isEmailVerified: savedUser.isEmailVerified
    };
  
    return { accessToken, refreshToken, user: userResponse };
  }
  
  static async login(loginData: {
    username: string;
    password: string;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: IUserResponse;
  }> {
    const { username, password } = loginData;

    const user = (await UserModel.findOne({ username })) as IUserDocument;
    if (!user) throw new ApiError("Invalid username or password", 404);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new ApiError("Invalid username or password", 404);

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    const userResponse: IUserResponse = {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      registrationDate: user.registrationDate,
      baseCreditScore: user.baseCreditScore,
      walletAddress: user.walletAddress,
      usdcBalance: user.usdcBalance,
      ethBalance: user.ethBalance,
      gbeseTokenBalance: user.gbeseTokenBalance,
      role: user.role,
      isKYCVerified: user.isKYCVerified,
      isEmailVerified: user.isEmailVerified 
    };
    return { accessToken, refreshToken, user: userResponse };
  }

  static async getUserById(userId: string) {
    const user = await UserModel.findById(userId);
  
    if (!user) throw new ApiError('User not found', 404);
  
    return {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      registrationDate: user.registrationDate,
      baseCreditScore: user.baseCreditScore,
      walletAddress: user.walletAddress,
      usdcBalance: user.usdcBalance,
      ethBalance: user.ethBalance,
      gbeseTokenBalance: user.gbeseTokenBalance,
      role: user.role,
      isKYCVerified: user.isKYCVerified,
      isEmailVerified: user.isEmailVerified,
    };
  }
  
  static async getPublicUserById(userId: string) {
  const user = await UserModel.findById(userId);

  if (!user) throw new ApiError('User not found', 404);

  return {
    userId: user._id.toString(),
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    baseCreditScore: user.baseCreditScore,
  };
}

}
