import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, IUserDocument  } from '../Models';
import { IUserResponse } from '../../../common/interfaces/user'; 

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export class AuthService {
  // Register a new user
  static async register(userData: {
    username: string;
    password: string;
    email: string;
    phoneNumber?: string;
  }): Promise<{ token: string; user: IUserResponse }> {
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

    const savedUser = await newUser.save() as IUserDocument;

    const token = jwt.sign({ userId: savedUser._id }, JWT_SECRET, { expiresIn: '7d' });

    const userResponse: IUserResponse = {
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

    return { token, user: userResponse };
  }

  // Login a user
  static async login(loginData: { username: string; password: string }): Promise<{ token: string; user: IUserResponse }> {
    const { username, password } = loginData;

    const user = await UserModel.findOne({ username }) as IUserDocument;
    if (!user) throw new Error('Invalid username or password');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new Error('Invalid username or password');

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    const userResponse: IUserResponse = {
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

    return { token, user: userResponse };
  }
}
