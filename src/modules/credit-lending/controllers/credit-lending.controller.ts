import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../middleware/auth.middleware";
import LoanRepository from "../data-access/loan.repository";
import LoanService from "../services/loan.service";
import LenderService from "../services/lender.service";
import CreditScoreService from "../services/credit-score.service";
import ApiError from "../../../utils/ApiError";

export default class CreditLendingController {


	static async createNewLoanRequest(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const userId = req.userId;
			const { amount, term, interestRate } = req.body;
			const loanRequest = await LoanRepository.createLoanRequest(userId!, {
				amount,
				term,
				interestRate,
			});
			if (!loanRequest) {
				return next(new ApiError("Failed to create loan request", 400));
			}
			res.status(201).json(loanRequest);
		} catch (error) {
			if (error instanceof ApiError) {
				return next(new ApiError(error.message, error.statusCode));
			}
			return next(new ApiError("Internal Server Error", 500));
		}
	}

	static async getLoanRequest(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const loanRequestId = req.params.loanRequestId;
			const loanRequest = await LoanRepository.getLoanRequestById(
				loanRequestId
			);
			if (!loanRequest) {
				res.status(404).json({ message: "Loan request not found" });
				return;
			}
			if (loanRequest.isDeleted) {
				res.status(400).json({ message: "Loan request has been deleted" });
				return;
			}
			res.status(200).json(loanRequest);
		} catch (error) {
			if (error instanceof ApiError) {
				return next(new ApiError(error.message, error.statusCode));
			}
			return next(new ApiError("Internal Server Error", 500));
		}
	}

	static async getUserLoanRequests(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const userId = req.userId;
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 10;
			const loanRequests = await LoanRepository.getUserLoanRequests(
				userId!,
				page,
				limit
			);
			if (!loanRequests) {
				res.status(404).json({ message: "No loan requests found" });
				return;
			}
			res.status(200).json(loanRequests);
		} catch (error) {
			if (error instanceof ApiError) {
				return next(new ApiError(error.message, error.statusCode));
			}
			return next(new ApiError("Internal Server Error", 500));
		}
	}

	static async createLenderLoanOffer(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const userId = req.userId;
			const { loanRequestId, terms, interestRate } = req.body;
			const loanOffer = await LenderService.createLenderLoanOffer(
				userId!,
				loanRequestId,
				terms,
				interestRate
			);
			if (!loanOffer) {
				res.status(400).json({ message: "Failed to create loan offer" });
				return;
			}
			const approvedLoanRequest = await LenderService.approveLoanRequest(userId!, loanOffer.loanRequestId);
			if (!approvedLoanRequest) {
				res.status(400).json({ message: "Failed to approve loan request" });
				return;
			}
			res.status(201).json(approvedLoanRequest);
		} catch (error) {
			if (error instanceof ApiError) {
				return next(new ApiError(error.message, error.statusCode));
			}
			return next(new ApiError("Internal Server Error", 500));
		}
	}

	static async getLoanOfferById(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const { loanOfferId } = req.params;
			const data = await LoanRepository.getLoanOfferById(
				loanOfferId
			);
			if (!data) {
				res.status(404).json({ message: "No loan offers found" });
				return;
			}
			res.status(200).json(data);
		} catch (error) {
			if (error instanceof ApiError) {
				return next(new ApiError(error.message, error.statusCode));
			}
			return next(new ApiError("Internal Server Error", 500));
		}
	}

    static  async getLoanOfferByRequestId(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { loanRequestId } = req.params;
            const data = await LoanRepository.getLoanOfferByLoanRequestId(loanRequestId);
            if (!data) {
                res.status(404).json({ message: "Loan offer not found" });
                return;
            }
            res.status(200).json(data);
        }catch (error) {
			if (error instanceof ApiError) {
				return next(new ApiError(error.message, error.statusCode));
			}
			return next(new ApiError("Internal Server Error", 500));
		}
    }

	static async createLoan(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const { loanRequestId, lenderId } = req.body;
			if (!lenderId) {
				res.status(400).json({ message: "Lender ID is required" });
				return;
			}
			if (!loanRequestId) {
				res.status(400).json({ message: "Loan request ID is required" });
				return;
			}
			const loanRequest = await LoanRepository.getLoanRequestById(
				loanRequestId
			);
			if (!loanRequest) {
				res.status(404).json({ message: "Loan request not found" });
				return;
			}
			if (loanRequest.status !== "approved") {
				res.status(400).json({ message: "Loan request is not approved" });
				return;
			}
			if (loanRequest.isDeleted) {
				res.status(400).json({ message: "Loan request has been deleted" });
                return;
			}
			const data = await LoanService.createBorrowerLoan(
				lenderId,
				loanRequest!
			);
			res.status(200).json({ message: "Loan created successfully", data });
		} catch (error) {
			if (error instanceof ApiError) {
				return next(new ApiError(error.message, error.statusCode));
			}
			return next(new ApiError("Internal Server Error", 500));
		}
	}

	static async getLoanById(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const { loanId } = req.params;
			const data = await LoanRepository.getLoanById(loanId);
			if (!data) {
                res.status(404).json({ message: "Loan not found" });
                return;
			}
			res.status(200).json(data);
		} catch (error) {
			if (error instanceof ApiError) {
				return next(new ApiError(error.message, error.statusCode));
			}
			return next(new ApiError("Internal Server Error", 500));
		}
	}

	static async getLenderLoans(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const userId = req.userId;
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 10;
			const data = await LoanRepository.getUserLoans(userId!, page, limit);
			if (!data) {
				res.status(404).json({ message: "No loans found" });
                return;
			}
			res.status(200).json(data);
		} catch (error) {
			if (error instanceof ApiError) {
				return next(new ApiError(error.message, error.statusCode));
			}
			return next(new ApiError("Internal Server Error", 500));
		}
	}

	static async getCreditScoreByUserId(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const { userId } = req.params;
			const creditScore = await CreditScoreService.getCreditScore(userId);
			res.status(200).json(creditScore);
		} catch (error) {
			if (error instanceof ApiError) {
				return next(new ApiError(error.message, error.statusCode));
			}
			return next(new ApiError("Internal Server Error", 500));
		}
	}
}
