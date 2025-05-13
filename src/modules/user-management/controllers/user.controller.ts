import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import ApiError from '../../../utils/ApiError';
import { verifyRefreshToken, generateAccessToken } from '../../../utils/auth.utils';
import { AuthRequest } from '../../../common/types/authTypes';


export class UserController {
  static async initiateRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.initiateRegistration(req.body);
      return next(res.status(200).json({
        message: 'OTP sent to email. Please verify to complete registration.',
      }));
    } catch (error: any) {
      return next(res.status(error.statusCode || 500).json({ error: error.message }));
    }
  }

  static async verifyEmailAndCreateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const result = await AuthService.verifyEmailAndCreateUser(email, otp);
      return next(res.status(201).json({
        message: 'Account successfully created.',
        ...result,
      }));
    } catch (error: any) {
      return next(res.status(error.statusCode || 500).json({ error: error.message }));
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      return next(res.status(200).json({
        message: 'Login successful.',
        ...result,
      }));
    } catch (error: any) {
      return next(res.status(error.statusCode || 500).json({ error: error.message }));
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.refreshToken;
      if (!token) {
        return next(res.status(401).json({ error: 'Refresh token not found' }));
      }

      const payload = verifyRefreshToken(token) as { userId: string };
      const newAccessToken = generateAccessToken(payload.userId);
      return next(res.status(200).json({ accessToken: newAccessToken }));
    } catch (err: any) {
      return next(res.status(403).json({ error: 'Invalid or expired refresh token' }));
    }
  }
  
static async getUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId; 

    if (!userId) {
      return next(new ApiError('Unauthorized', 401));
    }

    const user = await AuthService.getUserById(userId);

    return next(res.status(200).json(user));
  } catch (error: any) {
    return next(new ApiError(error.message, error.statusCode || 500));
  }
}

static async getUserByIdPublic(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const user = await AuthService.getPublicUserById(id);
    return next(res.status(200).json(user));
  } catch (error: any) {
    return next(new ApiError(error.message, error.statusCode || 500));
  }
}

}
