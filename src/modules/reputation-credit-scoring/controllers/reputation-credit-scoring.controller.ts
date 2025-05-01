import { NextFunction, Response } from "express";
import { AuthRequest } from "../../../middleware/auth.middleware";
import CreditScoreService from "../services/credit-score.service";
import ApiError from "../../../utils/ApiError";


export default class CreditScoreController {
    static async getCreditScoreByUserId(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const creditScore = await CreditScoreService.getCreditScore(userId);
            res.status(200).json(creditScore);
        } catch (error) {
            if (error instanceof ApiError) {
                return next(new ApiError(error.message, error.statusCode));
            }
            return next(new ApiError("Internal Server Error", 500));
        }
    }
}
