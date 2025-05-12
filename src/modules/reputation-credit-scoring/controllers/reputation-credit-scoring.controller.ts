import { NextFunction, Response } from "express";
import { AuthRequest } from "../../../middleware/auth.middleware"; 
import CreditScoreService from "../services/credit-score.service";
import ApiError from "../../../utils/ApiError";
import CreditScoreRepository from "../data-access/credit-score.repository";

export default class CreditScoreController {
    static async getCreditScoreByUserId(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params; 
            const creditScore = await CreditScoreRepository.getCreditScore(userId); 

            if (!creditScore) { 
                return next(new ApiError("Credit score not found", 404)); 
            }

            res.status(200).json(creditScore); 
        } catch (error) {
            if (error instanceof ApiError) {
                return next(new ApiError(error.message, error.statusCode)); 
            }
            return next(new ApiError("Internal Server Error", 500)); 
        }
    }

    static async getUserLoanLimit(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { userId } = req.user!; 
            if (!userId) {
                return next(new ApiError("User ID is missing", 400)); 
            }

            const userLoanLimit = await CreditScoreService.checkLoanLimit(userId);

            if (userLoanLimit === undefined || userLoanLimit === null) {
                return next(new ApiError("Loan limit not found", 404)); 
            }

            res.status(200).json({
                success: true,
                loanLimit: userLoanLimit
            }); 
        } catch (error) {
            if (error instanceof ApiError) {
                return next(new ApiError(error.message, error.statusCode));
            }
            return next(new ApiError("Internal Server Error", 500)); 
        }
    }
}
