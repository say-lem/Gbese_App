import { ClientSession } from "mongoose";
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

    static async updateCreditScore(userId: string, score: number, session: ClientSession) {
        const updatedCreditScore = await CreditScoreRepository.updateCreditScore(userId, score, session);
        if (!updatedCreditScore) {
            throw new ApiError('Failed to update credit score', 400);
        }
        await session.commitTransaction();
        return updatedCreditScore;
    }

    static async addCreditScoreHistory(userId: string, score: number, session: ClientSession) {
        const history = await CreditScoreRepository.addCreditScoreHistory(userId, score, session);
        if (!history) {
            throw new ApiError('Failed to add credit score history', 400);
        }
        await session.commitTransaction();
        return history;
    }
}