import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import ApiError from '../../../utils/ApiError';
import { AuthRequest } from '../../../common/types/authTypes';

export class UserController {
  static async initiateRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.initiateRegistration(req.body);
      res.status(200).json({
        message: 'OTP sent to email. Please verify to complete registration.',
      });
    } catch (error: any) {
      next(new ApiError(error.message, error.statusCode || 500));
    }
  }

  static async verifyEmailAndCreateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const { user, accessToken, refreshToken } = await AuthService.verifyEmailAndCreateUser(email, otp);

      // Set HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        message: 'Account successfully created.',
        accessToken,
        user,
      });
    } catch (error: any) {
      next(new ApiError(error.message, error.statusCode || 500));
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken, user } = await AuthService.login(req.body);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: 'Login successful.',
        accessToken,
        user,
      });
    } catch (error: any) {
      next(new ApiError(error.message, error.statusCode || 500));
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.refreshToken;
      if (!token) throw new ApiError('Refresh token not found', 401);

      const accessToken = AuthService.refreshAccessToken(token);
      res.status(200).json({ accessToken });
    } catch (error: any) {
      next(new ApiError(error.message, error.statusCode || 403));
    }
  }

  static async getUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new ApiError('Unauthorized', 401);

      const user = await AuthService.getUserById(userId);
      res.status(200).json(user);
    } catch (error: any) {
      next(new ApiError(error.message, error.statusCode || 500));
    }
  }

  static async getUserByIdPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await AuthService.getPublicUserById(id);
      res.status(200).json(user);
    } catch (error: any) {
      next(new ApiError(error.message, error.statusCode || 500));
    }
  }
}
