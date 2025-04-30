import { CreditScoreModel } from "../models/index";

export default class CreditScoreRepository {
    
    static async getCreditScore(userId: string) {
        return CreditScoreModel.findOne({ userId }).exec();
    }

    static async updateCreditScore(userId: string, score: number) {
        return CreditScoreModel.findOneAndUpdate(
            { userId },
            { score, lastUpdated: new Date() },
            { new: true }
        ).exec();
    }

    static async addCreditScoreHistory(userId: string, score: number) {
        return CreditScoreModel.findOneAndUpdate(
            { userId },
            { $push: { history: { date: new Date(), score } } },
            { new: true }
        ).exec();
    }
}