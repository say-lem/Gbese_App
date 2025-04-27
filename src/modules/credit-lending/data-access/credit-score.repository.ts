export default class CreditScoreRepository {
    constructor(private creditScoreModel: any) {}

    async getCreditScore(userId: string) {
        return this.creditScoreModel.findOne({ userId }).exec();
    }

    async updateCreditScore(userId: string, score: number) {
        return this.creditScoreModel.findOneAndUpdate(
            { userId },
            { score, lastUpdated: new Date() },
            { new: true }
        ).exec();
    }

    async addCreditScoreHistory(userId: string, score: number) {
        return this.creditScoreModel.findOneAndUpdate(
            { userId },
            { $push: { history: { date: new Date(), score } } },
            { new: true }
        ).exec();
    }
}