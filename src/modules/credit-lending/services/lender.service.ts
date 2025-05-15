import { Types } from "mongoose";
import LoanRepository from "../data-access/loan.repository";
import ApiError from "../../../utils/ApiError";

export default class LenderService {

	static async createLenderLoanOffer(
		userId: string,
		minLoanAmount: number,
		maxLoanAmount: number,
		terms: number,
		interestRate: number
	) {
		if (!userId) {
			throw new ApiError("User is not authorized to create a loan offer", 400);
		}

		// Create a new loan offer
		const newLoanOffer = await LoanRepository.createLoanOffer(userId, {
			lenderId: userId as unknown as Types.ObjectId,
			minLoanAmount,
			maxLoanAmount,
			terms,
			interestRate,
			status: "open",
		});

		return newLoanOffer;
	}

	static async approveLoanRequest(
		userId: string,
		loanRequestId: string | Types.ObjectId
	) {

		//TODO: modify Flow to check if loan lender has sufficient amount to loan
		if (!userId) {
			throw new ApiError("User is not authorized to this loan request", 400);
		}
		const loanRequest = await LoanRepository.getLoanRequestById(
			loanRequestId.toString()
		);
		if (!loanRequest) {
			throw new ApiError("Loan request not found", 404);
		}
		if (loanRequest.status !== "pending") {
			throw new ApiError("Loan request has been processed already", 400);
		}

		if (loanRequest.isDeleted) {
			throw new ApiError("Loan request has been deleted", 400);
		}

		// check if loan offer already exists for this request
		const loanOffer = await LoanRepository.getLoanOfferByLoanRequestId(
			loanRequestId.toString()
		);

		if (!loanOffer) {
			throw new ApiError("Loan offer not found for this request", 404);
		}
		// Create a new loan offer
		const updatedLoanOffer = await LoanRepository.updateLoanOfferStatus(
			loanOffer.loanOfferId.toString(),
			"approved"
		);

        if (!updatedLoanOffer) {
            throw new ApiError("Failed to approve loan offer", 400);
        }

        const updatedLoanRequest = await LoanRepository.updateLoanRequestStatus(
            loanRequestId.toString(),
            "approved"
        );

		if (!updatedLoanRequest) {
            throw new ApiError("Failed to approve loan request", 400);
		}

        return updatedLoanRequest;
	}

	static async rejectLoanRequest(
		userId: string,
		loanRequestId: string | Types.ObjectId
	){
		//TODO: implement rejection of loan request
	}
}
