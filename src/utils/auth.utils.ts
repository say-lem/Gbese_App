import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_REFRESH_SECRET } from "../config/constants";

export const generateAccessToken = (userId: string, email: string) => {
	return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '3m' });
  };
  
  export const generateRefreshToken = (userId: string, email: string) => {
	return jwt.sign({ userId, email }, JWT_REFRESH_SECRET, { expiresIn: '1d' });
  };

export const verifyAccessToken = (token: string) => {
	return jwt.verify(token, JWT_SECRET);
};

export const verifyRefreshToken = (token: string) => {
	return jwt.verify(token, JWT_REFRESH_SECRET);
};
