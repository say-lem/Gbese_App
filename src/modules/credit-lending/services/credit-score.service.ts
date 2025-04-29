import CreditScoreRepository from "../data-access/credit-score.repository";

export default class CreditScoreService {
    
    static async getCreditScore(userId: string) {
        const creditScore = await CreditScoreRepository.getCreditScore(userId);
        if (!creditScore) {
            throw new Error('Credit score not found');
        }
        return creditScore;
    }

    static async updateCreditScore(userId: string, score: number) {
        const updatedCreditScore = await CreditScoreRepository.updateCreditScore(userId, score);
        if (!updatedCreditScore) {
            throw new Error('Failed to update credit score');
        }
        return updatedCreditScore;
    }

    static async addCreditScoreHistory(userId: string, score: number) {
        const history = await CreditScoreRepository.addCreditScoreHistory(userId, score);
        if (!history) {
            throw new Error('Failed to add credit score history');
        }
        return history;
    }
}