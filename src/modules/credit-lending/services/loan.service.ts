import { Types } from "mongoose";
import LoanRepository from "../data-access/loan.repository";
import { ILoanRequest } from "../../../common/interfaces/loanRequest";

export default class LoanService {
	constructor(private loanRepository: LoanRepository) {}

    async createBorrowerLoan(lenderId: string, loanRequest: Partial<ILoanRequest>) {
        if (!lenderId) {
            throw new Error("user is not authorized to create a loan");
        }
        if (!loanRequest) {
            throw new Error("Loan request is required");
        }
        if (loanRequest.status !== "approved") {
            throw new Error("Loan request is not approved");
        }
        if (loanRequest.isDeleted) {
            throw new Error("Loan request has been deleted");
        }
        const loan = await this.loanRepository.createLoan({
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
		});

        if (!loan) {
            throw new Error("Failed to create loan");
        }
        return loan;
    }

    async payDueLoan(){
        // TODO: Implement this method
        // This method should handle the payment of due loans
        // It should check the repayment schedule and update the loan status accordingly
        // You can use the loanRepository to fetch loans and update their status

        throw new Error("Method not implemented");
    }

    async updateLoanStatus() {
        // TODO: Implement this method
        // This method should handle the updating of loan statuses based on certain conditions
        // It should check the repayment schedule and update the loan status accordingly
        // You can use the loanRepository to fetch loans and update their status
        throw new Error("Method not implemented");
    }
}