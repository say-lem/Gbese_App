import { ClientSession } from "mongoose";
import ApiError from "../../../utils/ApiError";
import CreditScoreRepository from "../data-access/credit-score.repository";
import { INITIAL_LOAN_LIMIT, LOAN_INTEREST, NEW_USER_CREDIT_SCORE } from "../../../config/constants";

export default class CreditScoreService {
    
    static async checkLoanLimit(userId: string, session?: ClientSession ) {
        const creditScore = await CreditScoreRepository.getCreditScore(userId, session);
        if (!creditScore) {
            throw new ApiError('Unable to get Loan Limit', 404);
        }
        const eligableLoan = (creditScore.score / NEW_USER_CREDIT_SCORE) * INITIAL_LOAN_LIMIT;
        
        return eligableLoan;
    }

    static async updateCreditScore(userId: string, scoreChange: number, reason:string, session?: ClientSession) {
        const history = await CreditScoreRepository.updateCreditScoreHistory(userId, scoreChange, reason, session);
        if (!history) {
            throw new ApiError('Failed to add credit score history', 400);
        }
        return history;
    }
}