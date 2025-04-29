import CreditScoreRepository from "../data-access/credit-score.repository";

export default class CreditScoreService {
    constructor(
        private creditScoreRepository: CreditScoreRepository,
    ) {}

    async getCreditScore(userId: string) {
        const creditScore = await this.creditScoreRepository.getCreditScore(userId);
        if (!creditScore) {
            throw new Error('Credit score not found');
        }
        return creditScore;
    }

    async updateCreditScore(userId: string, score: number) {
        const updatedCreditScore = await this.creditScoreRepository.updateCreditScore(userId, score);
        if (!updatedCreditScore) {
            throw new Error('Failed to update credit score');
        }
        return updatedCreditScore;
    }

    async addCreditScoreHistory(userId: string, score: number) {
        const history = await this.creditScoreRepository.addCreditScoreHistory(userId, score);
        if (!history) {
            throw new Error('Failed to add credit score history');
        }
        return history;
    }
}