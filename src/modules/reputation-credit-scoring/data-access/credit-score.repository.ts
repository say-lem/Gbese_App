import { CreditScoreModel } from "../models/index";
import { ClientSession } from "mongoose";

export default class CreditScoreRepository {
    
    static async getCreditScore(userId: string) {
        return CreditScoreModel.findOne({ userId }).exec();
    }

    static async updateCreditScore(userId: string, score: number, session: ClientSession) {
        return CreditScoreModel.findOneAndUpdate(
            { userId },
            { score, lastUpdated: new Date() },
            { new: true, session }
        ).exec();
    }

    static async addCreditScoreHistory(userId: string, score: number, session: ClientSession) {
        return CreditScoreModel.findOneAndUpdate(
            { userId },
            { $push: { history: { date: new Date(), score } } },
            { new: true, session}
        ).exec();
    }
}