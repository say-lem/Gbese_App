import LoanRepository from "../data-access/loan.repository";
import { ILoanRequest } from "../../../common/interfaces/loanRequest";
import ApiError from "../../../utils/ApiError";
import { WalletService } from "../../wallet-management/services/wallet.service";
import { TransactionService } from "../../transaction-managemment/services/transaction.service";
import { ClientSession } from "mongoose";

export default class LoanService {
	static async createBorrowerLoan(
		lenderId: string,
		loanRequest: Partial<ILoanRequest>,
		session: ClientSession
	) {
		if (!lenderId) {
			throw new ApiError("user is not authorized to create a loan", 400);
		}
		if (!loanRequest) {
			throw new ApiError("Loan request is required", 400);
		}
		if (loanRequest.status !== "approved") {
			throw new ApiError("Loan request is not approved", 400);
		}
		if (loanRequest.isDeleted) {
			throw new ApiError("Loan request has been deleted", 400);
		}
		const loan = await LoanRepository.createLoan(
			{
				borrowerId: loanRequest.userId!.toString(),
				lenderId: lenderId,
				principalAmount: loanRequest.amount,
				interestRate: loanRequest.interestRate,
				term: loanRequest.term,
				startDate: new Date(),
				endDate: (() => {
					const startDate = new Date();
					const endDate = new Date(startDate);
					endDate.setMonth(startDate.getMonth() + loanRequest.term!); // Add the loan term in months
					return endDate;
				})(), // Term in months
				currentHolderId: loanRequest.userId!.toString(),
				originalBorrowerId: loanRequest.userId!.toString(),
				repaymentSchedule: (() => {
					const schedule = [];
					const monthlyPayment =
						(loanRequest.amount! * (1 + loanRequest.interestRate!)) /
						loanRequest.term!;
					for (let i = 0; i < loanRequest.term!; i++) {
						const date = new Date();
						date.setMonth(date.getMonth() + i + 1);
						schedule.push({
							dueDate: date,
							amountDue: monthlyPayment,
						});
					}
					return schedule;
				})(),
				repaymentProgress: 0,
				isOverdue: false,
				missedPaymentCount: 0,
				tokenId: "", // Assuming you will handle tokenization separately
			},
			session
		);

		if (!loan) {
			throw new ApiError("Failed to create loan", 400);
		}
		return loan;
	}

	static async disburseLoan(
		lenderId: string,
		borrowerId: string,
		amount: number
	) {
		if (!lenderId || !borrowerId) {
			throw new ApiError("user is not authorized to update fiat balance", 400);
		}
		if (!amount) {
			throw new ApiError("Amount is required", 400);
		}

		const updatedTx = await TransactionService.transfer(
			lenderId,
			borrowerId,
			amount,
			"loan"
		);

		// returns both the sender's and recipent transaction that was created as object
		return updatedTx;
	}

	static async payDueLoan(
		borrowerId: string,
		lenderId: string,
		amount: number,
		loanId: string,
		session?: ClientSession
	) {
		// This method should handle the payment of due loans
		// It should check the repayment schedule and update the loan status accordingly
		// You can use the loanRepository to fetch loans and update their status

		const loan = await LoanRepository.getLoanById(loanId, session);

		if (!loan) {
			throw new ApiError("loan not found", 404);
		}

		if (amount !== loan.repaymentSchedule[0].amountDue) {
			throw new ApiError("Amount been paid is less than Due Amount", 400);
		}

		if (loan.repaymentProgress == 100){
			throw new ApiError("Loan has already been paid completely", 400);
		}

		if (loan.isDeleted) {
			throw new ApiError("loan has been deleted", 404);
		}

		const UpdatedTx = await TransactionService.transfer(
			borrowerId,
			lenderId,
			amount,
			"transfer"
		);
		const isOverdue: boolean =
			loan.repaymentSchedule[
				loan.repaymentSchedule.length - 1
			].dueDate.getTime() - new Date().getTime() < 0;

		const updatedRepaymentSchedule = [...loan.repaymentSchedule];
		const paidPayments = updatedRepaymentSchedule.filter((payment) => payment.status == "Paid").length
		if (paidPayments + 1 < updatedRepaymentSchedule.length) {
			updatedRepaymentSchedule[ paidPayments + 1 ].status = "Paid";
		}

		const UpdatedLoan = await LoanRepository.UpdateLoan(
			loanId,
			{
				// updates the percentage loan payment proogress
				repaymentProgress: Math.round(((paidPayments + 1) / loan.repaymentSchedule.length) * 100),
				repaymentSchedule: updatedRepaymentSchedule,
				isOverdue: isOverdue,
				missedPaymentCount: updatedRepaymentSchedule.filter((payment) => payment.status == "Overdue").length,
				lastPaymentDate: new Date(),
			},
			session
		);

		if (!UpdatedLoan) {
			throw new ApiError("Unable to update loan", 400);
		}

		return { UpdatedTx, UpdatedLoan };
	}

	static async deleteLoan(loanId: string) {
		const loan = await LoanRepository.getLoanById(loanId);
		if (!loan) {
			throw new ApiError("Loan data not found", 404);
		}

		if (loan.repaymentProgress == 100) {
			await LoanRepository.UpdateLoan(loanId, {
				isDeleted: true
			});
		}
	}
}
