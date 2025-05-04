import { ICreditScore } from "../../../common/interfaces/creditScore";
import { CreditScoreModel } from "../models/index";
import { ClientSession } from "mongoose";

export default class CreditScoreRepository {
	static async getCreditScore(userId: string, session?: ClientSession) {
		return CreditScoreModel.findOne({ userId })
			.session(session ?? null)
			.exec();
	}

	static async createCreditScore(
		data: Partial<ICreditScore>,
		session?: ClientSession
	) {
		const creditScore = new CreditScoreModel({ data });

		return await creditScore.save({ session });
	}

	static async updateCreditScoreHistory(
		userId: string,
		scoreChange: number,
		reason: string,
		session?: ClientSession
	) {
		return CreditScoreModel.findOneAndUpdate(
			{ userId },
			{ $push: { history: { timestamp: Date.now(), scoreChange, reason } } },
			{ new: true, session }
		).exec();
	}
}
