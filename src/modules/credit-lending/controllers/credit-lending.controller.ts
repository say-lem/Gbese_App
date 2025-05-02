import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../middleware/auth.middleware";
import LoanRepository from "../data-access/loan.repository";
import LoanService from "../services/loan.service";
import LenderService from "../services/lender.service";
import CreditScoreService from "../../reputation-credit-scoring/services/credit-score.service";
import ApiError from "../../../utils/ApiError";
import mongoose from "mongoose";

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
				return next(new ApiError("Loan request not found", 404));
			}
			if (loanRequest.isDeleted) {
				return next(new ApiError("Loan request has been deleted", 400));
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
				return next(new ApiError("No loan requests found", 404));
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
				next(new ApiError("Failed to create loan offer", 400));
			}
			const approvedLoanRequest = await LenderService.approveLoanRequest(userId!, loanOffer.loanRequestId);
			if (!approvedLoanRequest) {
				return next( new ApiError("Failed to approve loan request", 400));
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
				return next(new ApiError("No loan offers found", 404));
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
                next(new ApiError("Loan offer not found", 404));
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

		const session = await mongoose.startSession();

		try {
			const userId = req.userId;
			
			const { loanRequestId, lenderId } = req.body;

			

			const loanTransaction = await session.withTransaction ( async () => {
				if (lenderId !== userId) {
					return next(new ApiError("User is not authorized to create a loan", 400));
				}
	
				if (!lenderId) {
					return next(new ApiError("Lender ID is required", 400));
				}
				if (!loanRequestId) {
					return next(new ApiError("Loan request ID is required", 400));
				}
				const loanRequest = await LoanRepository.getLoanRequestById(
					loanRequestId,
					session
				);
				if (!loanRequest) {
					return next(new ApiError("Loan request not found", 404));
				}
				if (loanRequest.status !== "approved") {
					return next(new ApiError("Loan request is not approved", 400));
				}
				if (loanRequest.isDeleted) {
					return next(new ApiError("Loan request has been deleted", 400));
				}
				const data = await LoanService.createBorrowerLoan(
					lenderId,
					loanRequest!,
					session
				);
				const transactionData = await LoanService.disburseLoan(
					lenderId,
					loanRequest.userId!.toString(),
					loanRequest.amount!
				);
	
				// TODO: Add logic to notify both lender and borrower about the loan disbursement
				// e.g using a notification service
				// await NotificationService.notifyUser(lenderId, "Loan disbursed", lenderTx);
				// await NotificationService.notifyUser(loanRequest.userId!.toString(), "Loan received", borrowerTx);

				await session.commitTransaction();
				return data;
			})

			if (loanTransaction){
				res.status(200).json({ message: "Loan created successfully", data: loanTransaction });
			}
				

		} catch (error) {
			if (session.inTransaction()){
				await session.abortTransaction();
			}

			console.log(error);
			
			if (error instanceof ApiError) {
				return next(new ApiError(error.message, error.statusCode));
			}
			return next(new ApiError("Internal Server Error", 500));
		} finally {
			await session.endSession()
		}
	}

	static async getLoanById(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const { loanId } = req.params;
			const data = await LoanRepository.getLoanById(loanId);
			if (!data) {
                return next(new ApiError("Loan not found", 404));
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
				return next(new ApiError("No loans found", 404));
			}
			res.status(200).json(data);
		} catch (error) {
			if (error instanceof ApiError) {
				return next(new ApiError(error.message, error.statusCode));
			}
			return next(new ApiError("Internal Server Error", 500));
		}
	}
}
