import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/constants";

export interface AuthRequest extends Request {
	user?: {
		userId: string;
		email?: string;
	};
}

export const authenticate = (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	const sessionToken = req.session.accessToken;
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		if (!sessionToken) {
			return next(
				res
					.status(401)
					.json({ error: "Unauthorized. Missing or invalid token." })
			);
		}
	}

  let token: string;

  if (authHeader){
    token = authHeader.split(" ")[1]
  } else{
    token = sessionToken!
  }

	try {
		const decoded = jwt.verify(token, JWT_SECRET) as {
			userId: string;
			email: string;
		};

		req.user = {
			userId: decoded.userId,
			email: decoded.email,
		};

		next();
	} catch (err) {
		return next(res.status(403).json({ error: "Forbidden. Invalid token." }));
	}
};
