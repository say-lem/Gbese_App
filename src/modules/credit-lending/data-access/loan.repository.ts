import { ILoan } from "./../../../common/interfaces/loan";
import { LoanModel } from "../models";
import { LoanOfferModel } from "../models/loan-offers.model";
import { ILoanOffer } from "../../../common/interfaces/loanOffer";
import { ILoanRequest } from "../../../common/interfaces/loanRequest";
import { LoanRequestModel } from "../models/loan-request.model";
import { paginate } from "../../../utils/Paginate";

export default class LoanRepository {
	constructor(
		private loanModel: typeof LoanModel,
		private loanOffer: typeof LoanOfferModel,
		private loanRequest: typeof LoanRequestModel
	) {}

	// Loan Request Methods
	async createLoanRequest(userId: string, data: Partial<ILoanRequest>) {
		return await this.loanRequest.create({
			userId,
			amount: data.amount,
			interestRate: data.interestRate,
			term: data.term,
			applicationDate: Date.now(),
			status: "pending",
		});
	}

	async getLoanRequestById(loanRequestId: string) {
		return this.loanRequest.findById(loanRequestId).exec();
	}

	async getUserLoanRequests(userId: string, page: number, limit: number) {
		return await paginate(this.loanRequest, page, limit, {
			userId,
			isDeleted: false,
		});
	}

    async updateLoanRequestStatus(loanRequestId: string, status: string) {
        return this.loanRequest
            .findByIdAndUpdate(loanRequestId, { $set: { status } }, { new: true })
			.exec();
        }

	// Loan Offer Methods
	async createLoanOffer(userId: string, data: Partial<ILoanOffer>) {
		return await this.loanOffer.create({
			loanRequestId: data.loanRequestId,
			lenderId: userId,
			terms: data.terms,
			interestRate: data.interestRate,
			offerDate: Date.now(),
			status: data.status,
		});
	}

	async getLoanOfferById(loanOfferId: string) {
		return this.loanOffer.findById(loanOfferId).exec();
	}

    async getLoanOfferByLoanRequestId(loanRequestId: string) {
        return this.loanOffer.findOne({ loanRequestId }).exec();
    }
	async updateLoanOfferStatus(loanOfferId: string, status: string) {
		return this.loanOffer
			.findByIdAndUpdate(loanOfferId, { $set: { status } }, { new: true })
			.exec();
	}


	// Loan Methods
	async createLoan(data: Partial<ILoan>) {
		return await this.loanModel.create({
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
	}

	async getLoanById(loanId: string) {
		return this.loanModel.findById(loanId).exec();
	}

	async getUserLoans(userId: string, page: number, limit: number) {
		return await paginate(this.loanModel, page, limit, {
			$or: [{ borrowerId: userId }, { lenderId: userId }],
			isDeleted: false,
		});
	}

	async UpdateLoan(loanId: string, data: Partial<ILoan>) {
		return this.loanModel.findByIdAndUpdate(
			loanId,
			{ $set: data },
			{ new: true }
		);
	}
}
