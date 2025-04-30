import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";

export const errorHandler = (
	err: Error,
	_req: Request,
	res: Response,
	next: NextFunction
) => {
	// Log the error for debugging purposes
	const statusCode = (err as ApiError).statusCode || 500;
	const message = (err as ApiError).message || "Internal Server Error";
	res
		.status(statusCode)
		.json({
			success: false,
			message,
			...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
		});
	next();
};

// Error handling for routes that are not found
export const notFound = (req: Request, res: Response, next: NextFunction) => {
	res
		.status(404)
		.json({ success: false, message: "Not found. Invalid Url path" });
	next();
};
