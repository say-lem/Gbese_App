<<<<<<< HEAD
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
=======
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants';

>>>>>>> 2ac05f9 (feat: integrate session management with Redis, add access and refresh token handling in user controller)

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email?: string;
  };
}

<<<<<<< HEAD
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
=======

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const sessionToken = req.session.accessToken;
>>>>>>> 2ac05f9 (feat: integrate session management with Redis, add access and refresh token handling in user controller)
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      res.status(401).json({ error: "Unauthorized. Missing or invalid token." })
    );
  }

  const token = authHeader.split(" ")[1];

  if(sessionToken !== token){
    return next(res.status(401).send({error: "Unauthorized. invalid token"}));
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
