import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { verifyRefreshToken, generateAccessToken } from '../../../utils/auth.utils';

export class UserController {
  static async register(req: Request, res: Response) {
    try {
      const { accessToken, refreshToken, user } = await AuthService.register(req.body);

      res
        .cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 1 * 24 * 60 * 60 * 1000 // 1 days
        })
        .status(201)
        .json({ accessToken, user });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { accessToken, refreshToken, user } = await AuthService.login(req.body);

      res
        .cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 1 * 24 * 60 * 60 * 1000 // 1 days
        })
        .status(200)
        .json({ accessToken, user });
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.refreshToken;
  
      if (!token) return next(res.status(401).json({ error: 'Refresh token not found' }));
  
      const payload = verifyRefreshToken(token) as { userId: string };
      const newAccessToken = generateAccessToken(payload.userId);
  
      return next(res.status(200).json({ accessToken: newAccessToken }));
    } catch (err: any) {
      return next(res.status(403).json({ error: 'Invalid or expired refresh token' }));
    }
  }
}
