import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, IUserDocument } from '../Models';
import { IUserResponse } from '../../../common/interfaces/user';
import { WalletService } from '../../wallet-management/services/wallet.service';
import ApiError from '../../../utils/ApiError';
import {
  generateAccessToken,
  generateRefreshToken
} from '../../../utils/auth.utils';
import { generateWalletForUser } from './address.service';
import CreditScoreRepository from '../../reputation-credit-scoring/data-access/credit-score.repository';
import { Types } from 'mongoose';

export class AuthService {
  // Register a new user
  static async register(userData: {
    username: string;
    password: string;
    email: string;
    phoneNumber?: string;
  }): Promise<{ accessToken: string; refreshToken: string; user: IUserResponse }> {
    const { username, password, email, phoneNumber } = userData;    

    const existing = await UserModel.findOne({ $or: [{ username }, { email }] });
    
    if (existing) throw new Error('Username or email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      username,
      passwordHash: hashedPassword,
      email,
      phoneNumber,
      registrationDate: new Date(),
      isKYCVerified: false,
      role: 'user'
    });
        
    const userWalletAddress = await generateWalletForUser(newUser._id.toString());
    newUser.walletAddress = userWalletAddress.address; // Set the wallet address for the user

    const savedUser = await newUser.save() as IUserDocument;

    await WalletService.createWallet(savedUser._id); //create a wallet for the user

    await CreditScoreRepository.createCreditScore({
      userId: savedUser.userId as unknown as Types.ObjectId,
      score: savedUser.baseCreditScore,
      history: [],

    })

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
      gbeseTokenBalance: savedUser.gbeseTokenBalance,
      role: savedUser.role,
      isKYCVerified: savedUser.isKYCVerified
    };

    return { accessToken, refreshToken, user: userResponse };
  }

  // Login a user
  static async login(loginData: { username: string; password: string }): Promise<{ accessToken: string; refreshToken: string; user: IUserResponse }> {
    const { username, password } = loginData;

    const user = await UserModel.findOne({ username }) as IUserDocument;
    if (!user) throw new ApiError('Invalid username or password', 404);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new ApiError('Invalid username or password', 404);

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
      gbeseTokenBalance: user.gbeseTokenBalance,
      role: user.role,
      isKYCVerified: user.isKYCVerified
    };

    return { accessToken, refreshToken, user: userResponse };
  }
}
