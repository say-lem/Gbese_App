import bcrypt from "bcryptjs";
import { UserModel, IUserDocument } from "../Models";
import { IUserResponse } from "../../../common/interfaces/user";
import { WalletService } from "../../wallet-management/services/wallet.service";
import ApiError from "../../../utils/ApiError";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../../utils/auth.utils";
import { CryptoTransactionService } from "../../transaction-managemment/services/cryptoTransaction.service";
import CreditScoreRepository from "../../reputation-credit-scoring/data-access/credit-score.repository";
import { generateOTP, otpExpiresIn } from "../../../utils/otp.utils";
import { sendVerificationEmail } from "../../../utils/email.utils";
import PendingUserModel from "../Models/pendingUser.model";

export class AuthService {
  static async initiateRegistration(userData: {
    username: string;
    password: string;
    email: string;
    phoneNumber?: string;
    role: "user" | "admin" | "lender";
  }) {
    const { username, password, email, phoneNumber, role } = userData;

    const allowedRoles = ["user", "admin", "lender"];
    if (!allowedRoles.includes(role)) {
      throw new ApiError("Invalid role provided", 400);
    }

    const existing = await UserModel.findOne({
      $or: [{ username }, { email }],
    });
    const pending = await PendingUserModel.findOne({ email });

    if (existing) {
      throw new ApiError("Email or username already exists", 409);
    }
    if (pending) {
      if (pending.expiresAt < new Date()) {
        await PendingUserModel.deleteOne({ email });
      } else {
        throw new ApiError(
          "A verification code has already been sent. Please check your email.",
          409
        );
      }
    }

    const otp = generateOTP();
    const expiresAt = otpExpiresIn();
    const passwordHash = await bcrypt.hash(password, 10);

    await PendingUserModel.create({
      username,
      email,
      phoneNumber,
      passwordHash,
      otp,
      expiresAt,
      role,
    });

    await sendVerificationEmail(email, otp);
  }

  static async verifyEmailAndCreateUser(email: string, otp: string) {
    const pending = await PendingUserModel.findOne({ email });
    if (!pending) throw new ApiError("No pending registration found", 404);

    if (pending.otp !== otp || pending.expiresAt < new Date()) {
      throw new ApiError("Invalid or expired OTP", 400);
    }

    const newUser = new UserModel({
      username: pending.username,
      passwordHash: pending.passwordHash,
      email: pending.email,
      phoneNumber: pending.phoneNumber,
      registrationDate: new Date(),
      isKYCVerified: false,
      isEmailVerified: true,
      role: pending.role || "user",
    });

    const savedUser = await newUser.save();

    const walletAddress = await CryptoTransactionService.generateWalletForUser(
      savedUser._id.toString()
    );
    savedUser.walletAddress = walletAddress.address;
    await savedUser.save();

    await WalletService.createWallet(savedUser._id.toString());
    await CreditScoreRepository.createCreditScore({
      userId: savedUser._id,
      score: savedUser.baseCreditScore,
      history: [],
    });

    await PendingUserModel.deleteOne({ email });

    const accessToken = generateAccessToken(
      savedUser._id.toString(),
      savedUser.email
    );
    const refreshToken = generateRefreshToken(
      savedUser._id.toString(),
      savedUser.email
    );

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
      isEmailVerified: savedUser.isEmailVerified,
    };

    return { accessToken, refreshToken, user: userResponse };
  }

  static async login(loginData: { email: string; password: string }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: IUserResponse;
  }> {
    const { email, password } = loginData;

    const user = (await UserModel.findOne({ email })) as IUserDocument;
    if (!user) throw new ApiError("Invalid email or password", 404);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new ApiError("Invalid email or password", 404);

    const accessToken = generateAccessToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString(), user.email);

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
      isEmailVerified: user.isEmailVerified,
    };

    return { accessToken, refreshToken, user: userResponse };
  }

  static async getUserById(userId: string) {
    const user = await UserModel.findById(userId);

    if (!user) throw new ApiError("User not found", 404);

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

    if (!user) throw new ApiError("User not found", 404);

    return {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      baseCreditScore: user.baseCreditScore,
    };
  }

  static refreshAccessToken(refreshToken: string): string {
    const payload = verifyRefreshToken(refreshToken) as {
      userId: string;
      email: string;
    };
    return generateAccessToken(payload.userId, payload.email);
  }
}
