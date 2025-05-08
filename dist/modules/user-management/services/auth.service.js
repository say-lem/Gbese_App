"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Models_1 = require("../Models");
const wallet_service_1 = require("../../wallet-management/services/wallet.service");
const ApiError_1 = __importDefault(require("../../../utils/ApiError"));
const auth_utils_1 = require("../../../utils/auth.utils");
class AuthService {
    // Register a new user
    static async register(userData) {
        const { username, password, email, phoneNumber } = userData;
        const existing = await Models_1.UserModel.findOne({ $or: [{ username }, { email }] });
        if (existing)
            throw new Error('Username or email already exists');
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = new Models_1.UserModel({
            username,
            passwordHash: hashedPassword,
            email,
            phoneNumber,
            registrationDate: new Date(),
            isKYCVerified: false,
            role: 'user'
        });
        const savedUser = await newUser.save();
        await wallet_service_1.WalletService.createWallet(savedUser._id); //create a wallet for the user
        const accessToken = (0, auth_utils_1.generateAccessToken)(savedUser._id.toString());
        const refreshToken = (0, auth_utils_1.generateRefreshToken)(savedUser._id.toString());
        const userResponse = {
            userId: savedUser._id.toString(),
            username: savedUser.username,
            email: savedUser.email,
            phoneNumber: savedUser.phoneNumber,
            registrationDate: savedUser.registrationDate,
            baseCreditScore: savedUser.baseCreditScore,
            gbeseTokenBalance: savedUser.gbeseTokenBalance,
            role: savedUser.role,
            isKYCVerified: savedUser.isKYCVerified
        };
        return { accessToken, refreshToken, user: userResponse };
    }
    // Login a user
    static async login(loginData) {
        const { username, password } = loginData;
        const user = await Models_1.UserModel.findOne({ username });
        if (!user)
            throw new ApiError_1.default('Invalid username or password', 404);
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch)
            throw new ApiError_1.default('Invalid username or password', 404);
        const accessToken = (0, auth_utils_1.generateAccessToken)(user._id.toString());
        const refreshToken = (0, auth_utils_1.generateRefreshToken)(user._id.toString());
        const userResponse = {
            userId: user._id.toString(),
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber,
            registrationDate: user.registrationDate,
            baseCreditScore: user.baseCreditScore,
            gbeseTokenBalance: user.gbeseTokenBalance,
            role: user.role,
            isKYCVerified: user.isKYCVerified
        };
        return { accessToken, refreshToken, user: userResponse };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map