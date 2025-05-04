import { LoanModel, LoanOfferModel, LoanRequestModel } from "../models/index";
import { ILoan } from "./../../../common/interfaces/loan";
import { ILoanOffer } from "../../../common/interfaces/loanOffer";
import { ILoanRequest } from "../../../common/interfaces/loanRequest";
import { paginate } from "../../../utils/Paginate";
import { ClientSession } from "mongoose";

export default class LoanRepository {
	// Loan Request Methods
	static async createLoanRequest(userId: string, data: Partial<ILoanRequest>) {
		return await LoanRequestModel.create({
			userId,
			amount: data.amount,
			interestRate: data.interestRate,
			term: data.term,
			applicationDate: Date.now(),
			status: "pending",
		});
	}

	static async getLoanRequestById(loanRequestId: string, session?: ClientSession) {
		return LoanRequestModel.findById(loanRequestId).session(session?? null).exec();
	}

	static async getUserLoanRequests(
		userId: string,
		page: number,
		limit: number
	) {
		return await paginate(LoanRequestModel, page, limit, {
			userId,
			isDeleted: false,
		});
	}

	static async updateLoanRequestStatus(loanRequestId: string, status: string) {
		return LoanRequestModel.findByIdAndUpdate(
			loanRequestId,
			{ $set: { status } },
			{ new: true }
		).exec();
	}

	// Loan Offer Methods
	static async createLoanOffer(userId: string, data: Partial<ILoanOffer>) {
		return await LoanOfferModel.create({
			loanRequestId: data.loanRequestId,
			lenderId: userId,
			terms: data.terms,
			interestRate: data.interestRate,
			offerDate: Date.now(),
			status: data.status,
		});
	}

	static async getLoanOfferById(loanOfferId: string) {
		return LoanOfferModel.findById(loanOfferId).exec();
	}

	static async getLoanOfferByLoanRequestId(loanRequestId: string) {
		return LoanOfferModel.findOne({ loanRequestId }).exec();
	}
	static async updateLoanOfferStatus(loanOfferId: string, status: string) {
		return LoanOfferModel.findByIdAndUpdate(
			loanOfferId,
			{ $set: { status } },
			{ new: true }
		).exec();
	}

	// Loan Methods
	static async createLoan(data: Partial<ILoan>, session?: ClientSession) {

		const loan = new LoanModel ({
			borrowerId: data.borrowerId,
			lenderId: data.lenderId,
			principalAmount: data.principalAmount,
			interestRate: data.interestRate,
			term: data.term,
			startDate: data.startDate,
			endDate: data.endDate,
			currentHolderId: data.currentHolderId,
			originalBorrowerId: data.originalBorrowerId,
			repaymentSchedule: data.repaymentSchedule,
			repaymentProgress: 0, // Initialize to 0
			isOverdue: false, // Initialize to false
			lastPaymentDate: null, // Initialize to null
			missedPaymentCount: 0, // Initialize to 0
			tokenId: data.tokenId,
			repaymentMethod: data.repaymentMethod,
		});


		return await loan.save({ session });
	}

	static async getLoanById(loanId: string, session?: ClientSession) {
		return LoanModel.findById(loanId).session(session ?? null).exec();
	}

	static async getUserLoans(userId: string, page: number, limit: number) {
		return await paginate(LoanModel, page, limit, {
			$or: [{ borrowerId: userId }, { lenderId: userId }],
			isDeleted: false,
		});
	}

	static async UpdateLoan(loanId: string, data: Partial<ILoan>, session?: ClientSession) {
		return await LoanModel.findByIdAndUpdate(
			loanId,
			{ $set: data },
			{ new: true, session }
		);
	}
}
