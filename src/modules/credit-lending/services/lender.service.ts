import { Types } from "mongoose";
import LoanRepository from "../data-access/loan.repository";

export default class LenderService {

	static async createLenderLoanOffer(
		userId: string,
		loanRequestId: string | Types.ObjectId,
		terms: number,
		interestRate: number
	) {
		if (!userId) {
			throw new Error("User is not authorized to create a loan offer");
		}
		const loanRequest = await LoanRepository.getLoanRequestById(
			loanRequestId.toString()
		);
		if (!loanRequest) {
			throw new Error("Loan request not found");
		}
		if (loanRequest.status !== "pending") {
			throw new Error("Loan request has been processed already");
		}

		if (loanRequest.isDeleted) {
			throw new Error("Loan request has been deleted");
		}

		// check if loan offer already exists for this request
		const loanOffer = await LoanRepository.getLoanOfferByLoanRequestId(
			loanRequestId.toString()
		);

		if (loanOffer) {
			throw new Error("Loan offer already exists for this request");
		}

		// Create a new loan offer
		const newLoanOffer = await LoanRepository.createLoanOffer(userId, {
			loanRequestId: loanRequestId as Types.ObjectId,
			terms,
			interestRate,
			status: "pending",
		});

		return newLoanOffer;
	}

	static async approveLoanRequest(
		userId: string,
		loanRequestId: string | Types.ObjectId
	) {
		if (!userId) {
			throw new Error("User is not authorized to this loan request");
		}
		const loanRequest = await LoanRepository.getLoanRequestById(
			loanRequestId.toString()
		);
		if (!loanRequest) {
			throw new Error("Loan request not found");
		}
		if (loanRequest.status !== "pending") {
			throw new Error("Loan request has been processed already");
		}

		if (loanRequest.isDeleted) {
			throw new Error("Loan request has been deleted");
		}

		// check if loan offer already exists for this request
		const loanOffer = await LoanRepository.getLoanOfferByLoanRequestId(
			loanRequestId.toString()
		);

		if (!loanOffer) {
			throw new Error("Loan offer not found for this request");
		}
		// Create a new loan offer
		const updatedLoanOffer = await LoanRepository.updateLoanOfferStatus(
			loanOffer.loanOfferId.toString(),
			"approved"
		);

        if (!updatedLoanOffer) {
            throw new Error("Failed to approve loan offer");
        }

        const updatedLoanRequest = await LoanRepository.updateLoanRequestStatus(
            loanRequestId.toString(),
            "approved"
        );

		if (!updatedLoanRequest) {
            throw new Error("Failed to approve loan request");
		}

        return updatedLoanRequest;
	}
}
