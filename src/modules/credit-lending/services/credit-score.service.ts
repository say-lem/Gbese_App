import ApiError from "../../../utils/ApiError";
import CreditScoreRepository from "../data-access/credit-score.repository";

export default class CreditScoreService {
    
    static async getCreditScore(userId: string) {
        const creditScore = await CreditScoreRepository.getCreditScore(userId);
        if (!creditScore) {
            throw new ApiError('Credit score not found', 404);
        }
        return creditScore;
    }

    static async updateCreditScore(userId: string, score: number) {
        const updatedCreditScore = await CreditScoreRepository.updateCreditScore(userId, score);
        if (!updatedCreditScore) {
            throw new ApiError('Failed to update credit score', 400);
        }
        return updatedCreditScore;
    }

    static async addCreditScoreHistory(userId: string, score: number) {
        const history = await CreditScoreRepository.addCreditScoreHistory(userId, score);
        if (!history) {
            throw new ApiError('Failed to add credit score history', 400);
        }
        return history;
    }
}