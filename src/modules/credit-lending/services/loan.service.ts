import LoanRepository from "../data-access/loan.repository";
import { ILoanRequest } from "../../../common/interfaces/loanRequest";
import ApiError from "../../../utils/ApiError";
import { WalletService } from "../../wallet-management/services/wallet.service";
import { TransactionService } from "../../transaction-managemment/services/transaction.service";

export default class LoanService {
	
    static async createBorrowerLoan(lenderId: string, loanRequest: Partial<ILoanRequest>) {
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
        const loan = await LoanRepository.createLoan({
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
            throw new ApiError("Failed to create loan", 400);
        }
        return loan;
    }

	static async disburseLoan(lenderId: string, borrowerId: string, amount: number) {
		if (!lenderId || !borrowerId) {
			throw new ApiError("user is not authorized to update fiat balance", 400);
		}
		if (!amount) {
			throw new ApiError("Amount is required", 400);
		}

		const [lenderTx, borrowerTx] = await TransactionService.transfer(
			lenderId,
			borrowerId,
			amount,
			"loan"
		);

		return { lenderTx, borrowerTx };
	}

    async payDueLoan(borrowerId: string, lenderId: string, amount: number, loanId: string){
        // TODO: Implement this method
        // This method should handle the payment of due loans
        // It should check the repayment schedule and update the loan status accordingly
        // You can use the loanRepository to fetch loans and update their status

		const loan = await LoanRepository.getLoanById(loanId);

		if (!loan){
			throw new ApiError("loan not found", 404);
		}

		if (amount !== loan.repaymentSchedule[0].amountDue){
			throw new ApiError("Amount been paid is less than Due Amount", 400);
		}

		if (loan.isDeleted){
			throw new ApiError("loan has been deleted", 404);
		}

		const [borrowerTx, lenderTx] = await TransactionService.transfer(
			borrowerId,
			lenderId,
			amount,
			"transfer"
		);

		const UpdatedLoan = LoanRepository.UpdateLoan(loanId, {
			repaymentProgress: ((loan.repaymentProgress + 1) / loan.repaymentSchedule.length) * 100,
			repaymentSchedule: loan.repaymentSchedule.slice(1),
			isOverdue: false,
			missedPaymentCount: 0,
			lastPaymentDate: new Date(Date.now())
		});

		if (!UpdatedLoan) {
			throw new ApiError("Unable to update loan", 400)
		}

		return { borrowerTx, lenderTx, UpdatedLoan}
        
    }

    async updateLoanStatus() {
        // TODO: Implement this method
        // This method should handle the updating of loan statuses based on certain conditions
        // It should check the repayment schedule and update the loan status accordingly
        // You can use the loanRepository to fetch loans and update their status
        throw new Error("Method not implemented");
    }
}