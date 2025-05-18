import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import ApiError from "../../../utils/ApiError";
import { AuthRequest } from "../../../common/types/authTypes";
import {
	generateAccessToken,
	verifyRefreshToken,
} from "../../../utils/auth.utils";

declare module "express-session" {
	interface SessionData {
		accessToken?: string;
		refreshToken?: string;
	}
}

export class UserController {
	static async initiateRegistration(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		try {
			await AuthService.initiateRegistration(req.body);
			res.status(200).json({
				message: "OTP sent to email. Please verify to complete registration.",
			});
		} catch (error: any) {
			return next(new ApiError(error.message, error.statusCode || 500));
		}
	}

	static async verifyEmailAndCreateUser(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		try {
			const { email, otp } = req.body;
			const result = await AuthService.verifyEmailAndCreateUser(email, otp);
			res.status(201).json({
				message: "Account successfully created.",
				...result,
			});
		} catch (error: any) {
			return next(new ApiError(error.message, error.statusCode || 500));
		}
	}

	static async login(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await AuthService.login(req.body);
			req.session.accessToken = result.accessToken;
			req.session.refreshToken = result.refreshToken;
			res.status(200).json({
				message: "Login successful.",
				...result,
			});
		} catch (error: any) {
			return next(new ApiError(error.message, error.statusCode || 500));
		}
	}

	static async refreshToken(req: Request, res: Response, next: NextFunction) {
		try {
			const token = req.session.refreshToken;
			if (!token) {
				return next(new ApiError("Refresh token not found", 401));
			}

			const newAccessToken = AuthService.refreshAccessToken(token);
			req.session.accessToken = newAccessToken;
			res.status(200).json({ accessToken: newAccessToken });
		} catch (err: any) {
			return next(new ApiError("Invalid or expired refresh token", 403));
		}
	}

	static async getUser(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const userId = req.user?.userId;
			if (!userId) throw new ApiError("Unauthorized", 401);

			const user = await AuthService.getUserById(userId);

			res.status(200).json(user);
		} catch (error: any) {
			return next(new ApiError(error.message, error.statusCode || 500));
		}
	}

	static async getUserByIdPublic(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		try {
			const { id } = req.params;

			const user = await AuthService.getPublicUserById(id);
			res.status(200).json(user);
		} catch (error: any) {
			return next(new ApiError(error.message, error.statusCode || 500));
		}
	}

	static async logout(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			req.session.destroy(() => {
				res.status(200).send({ message: "Logout successful" });
			});
		} catch (error: any) {
      return next(new ApiError(error.message, error.statusCode || 500));
    }
	}
}
