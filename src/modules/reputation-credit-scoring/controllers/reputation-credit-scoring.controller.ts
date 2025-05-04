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
            res.status(200).json(creditScore);
        } catch (error) {
            if (error instanceof ApiError) {
                return next(new ApiError(error.message, error.statusCode));
            }
            return next(new ApiError("Internal Server Error", 500));
        }
    }

    static async getUserLoanLimit(req: AuthRequest, res: Response, next: NextFunction){
        try {
            const { userId } = req;
            const userLoanLimit = await CreditScoreService.checkLoanLimit(userId!);
            res.status(200).send({success: true, loanLimit: userLoanLimit})
        } catch (error) {
            if (error instanceof ApiError) {
                return next(new ApiError(error.message, error.statusCode));
            }
            return next(new ApiError("Internal Server Error", 500));
        }
    }
}
