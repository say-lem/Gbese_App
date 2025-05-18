import { WalletService } from "./../../wallet-management/services/wallet.service";
import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../middleware/auth.middleware";
import LoanRepository from "../data-access/loan.repository";
import LoanService from "../services/loan.service";
import LenderService from "../services/lender.service";
import CreditScoreService from "../../reputation-credit-scoring/services/credit-score.service";
import ApiError from "../../../utils/ApiError";
import mongoose from "mongoose";
import { LOAN_INTEREST } from "../../../config/constants";
import NotificationService from "../../notification-service/services/notification.service";

export default class CreditLendingController {
	static async createNewLoanRequest(
		req: AuthRequest,
		res: Response,
		next: NextFunction
	) {
		const session = await mongoose.startSession();

		try {
			const userId = req.user?.userId!;
			const { amount, term, loanOfferId, purpose } = req.body;

			const loanRequestTransaction = await session.withTransaction(async () => {
				// check credit score for maximum loan amount
				const eligableLoan = await CreditScoreService.checkLoanLimit(
					userId!,
					session
				);
				if (eligableLoan < amount) {
					throw new ApiError(
						`Your Eligible loan limit is ${eligableLoan.toLocaleString()}`,
						400
					);
				}

				// get the loan
				const loanOffer = await LoanRepository.getLoanOfferById(loanOfferId);

				if (!loanOffer) {
					throw new ApiError("Unable to Fetch Loan Offer", 404);
				}

				if (loanOffer.status == "suspended") {
					throw new ApiError(
						"Loan offer has been suspended. Please Try another loan Offer",
						400
					);
				}

				if (amount < loanOffer.minLoanAmount || amount > loanOffer.maxLoanAmount){
					throw new ApiError("Invalid loan Amount. loan amount is below or above loan range", 400);
				}

				//check if the lender has sufficient balance to disburse loan
				const checkedLenderWallet = await WalletService.getWalletByUserId(
					loanOffer.lenderId.toString()
				);
				if (checkedLenderWallet.fiatBalance < amount) {
					await LoanRepository.updateLoanOfferStatus(loanOfferId, "suspended", session);
					// TODO: Notify lender that his loan is suspended due to insuffient funds
					throw new ApiError(
						"Loan offer has been suspended. Please Try another loan Offer",
						404
					);
				}

				// creates the loan request
				const loanRequest = await LoanRepository.createLoanRequest(userId!, {
					amount,
					term,
					purpose,
					interestRate: loanOffer.interestRate,
				}, session);
				if (!loanRequest) {
					return next(new ApiError("Failed to create loan request", 400));
				}

				// updates the loan Offer 
				const updatedLoanOffer =
					await LoanRepository.updateLoanOfferLoanRequestId(
						loanOffer.loanOfferId.toString(),
						loanRequest.loanRequestId.toString(), 
						session
					);
				if (!updatedLoanOffer) {
					return next(new ApiError("Unable to create loan request", 400));
				}
				await session.commitTransaction();
				return loanRequest;
			});

			res.status(201).send({
				success: true,
				message: "Loan Request created successfully",
				data: loanRequestTransaction,
			});
			await NotificationService.notifyUserLoanRequest(userId!, {
				success: true,
				message: "Loan Request created successfully",
			});
		} catch (error) {
			if (session.inTransaction()) {
				await session.abortTransaction();
			}
			if (error instanceof ApiError) {
				return next(new ApiError(error.message, error.statusCode));
			}
			return next(new ApiError("Internal Server Error", 500));
		} finally {
			session.endSession();
		}
	}

	static async getLoanRequest(
		req: AuthRequest,
		res: Response,
		next: NextFunction
	) {
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

	static async getUserLoanRequests(
		req: AuthRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			const userId = req.user?.userId!;
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

	static async createLenderLoanOffer(
		req: AuthRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			const userId = req.user?.userId!;
			const { minLoanAmount, maxLoanAmount, terms, interestRate } = req.body;

			if (interestRate > LOAN_INTEREST) {
				return next(
					new ApiError(
						`Invalid Interest Rate. Should not be more than ${
							LOAN_INTEREST * 100
						}%`,
						400
					)
				);
			}

			//check if the lender has sufficient balance to create loan offer
			const checkedLenderWallet = await WalletService.getWalletByUserId(
				userId!.toString()
			);

			const balance = checkedLenderWallet.fiatBalance;

			if ( balance < minLoanAmount || balance < maxLoanAmount) {
					throw new ApiError(
						"Failed to create loan offer due to insufficent funds.",
						400
					);
				}

			const loanOffer = await LenderService.createLenderLoanOffer(
				userId!,
				parseInt(minLoanAmount),
				parseInt(maxLoanAmount),
				parseInt(terms),
				parseInt(interestRate)
			);
			if (!loanOffer) {
				return next(new ApiError("Failed to create loan offer", 400));
			}

			res.status(201).send({
				success: true,
				message: "Loan Offer created Successfully",
				data: loanOffer,
			});
		} catch (error) {
			if (error instanceof ApiError) {
				return next(new ApiError(error.message, error.statusCode));
			}
			return next(new ApiError("Internal Server Error", 500));
		}
	}

	static async getAllLoanOffers(
		req: AuthRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			const data = await LoanRepository.getAllLoanOffers();
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

	static async getLoanOfferById(
		req: AuthRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			const { loanOfferId } = req.params;
			const data = await LoanRepository.getLoanOfferById(loanOfferId);
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

	static async getLoanOfferByRequestId(
		req: AuthRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			const { loanRequestId } = req.params;
			const data = await LoanRepository.getLoanOfferByLoanRequestId(
				loanRequestId
			);
			if (!data) {
				next(new ApiError("Loan offer not found", 404));
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

	static async approveLoanRequest(req: AuthRequest, res: Response, next: NextFunction) {
		const session = await mongoose.startSession();

		try {
			const userId = req.user?.userId!;
			
			const { loanRequestId, lenderId } = req.body;

			const loanTransaction = await session.withTransaction(async () => {
				if (lenderId !== userId) {
					return next(
						new ApiError("User is not authorized to create a loan", 400)
					);
				}

				if (!lenderId) {
					return next(new ApiError("Lender ID is required", 400));
				}
				if (!loanRequestId) {
					return next(new ApiError("Loan request ID is required", 400));
				}
				const approvedLoanRequest = await LenderService.approveLoanRequest(
					userId!,
					loanRequestId,
					session
				);
				if (!approvedLoanRequest) {
					return next(new ApiError("Failed to approve loan request", 404));
				}

				if (approvedLoanRequest.status !== "approved") {
					return next(new ApiError("Loan request is not approved", 400));
				}
				if (approvedLoanRequest.isDeleted) {
					return next(new ApiError("Loan request has been deleted", 400));
				}

				const borrowerId = approvedLoanRequest.userId.toString();

				const data = await LoanService.createBorrowerLoan(
					lenderId,
					approvedLoanRequest,
					session
				);
				const transactionData = await LoanService.disburseLoan(
					lenderId,
					borrowerId,
					approvedLoanRequest.amount
				);

				await session.commitTransaction();
				await NotificationService.notifyTransactionDone(
					lenderId,
					borrowerId,
					transactionData
				);

				return data;
			});

			if (loanTransaction) {
				res.status(200).json({
					message: "Loan created successfully",
					data: loanTransaction,
				});
			}
		} catch (error) {
			if (session.inTransaction()) {
				await session.abortTransaction();
			}

			if (error instanceof ApiError) {
				return next(new ApiError(error.message, error.statusCode));
			}
			return next(new ApiError("Internal Server Error", 500));
		} finally {
			await session.endSession();
		}
	}

	static async rejectLoanRequest(req: AuthRequest, res: Response, next: NextFunction){

		const session = await mongoose.startSession();
		try {

			const userId = req.user?.userId!
			const {loanRequestId} = req.body;

			const loanTransaction = await session.withTransaction(async () => {

				const rejectedLoanRequest = await LenderService.rejectLoanRequest(
					userId,
					loanRequestId,
					session
				);

				if (!rejectedLoanRequest) {
					throw new ApiError("Unable to reject Loan request. Try Again", 400);
				}
				await session.commitTransaction()
				return rejectedLoanRequest;
			});

			res.status(200).send({success:true, message: "Loan request Rejected Successfully", data: loanTransaction});
			await NotificationService.notifyUserLoanRequest(loanTransaction.userId.toString(), "Your Loan Request has been rejected. Please check!");

		} catch (error) {
			
		} finally{
			await session.endSession();
		}
	}

	static async getLoanById(
		req: AuthRequest,
		res: Response,
		next: NextFunction
	) {
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

	static async getUserLoans(
		req: AuthRequest,
		res: Response,
		next: NextFunction
	) {
		try {
			const userId = req.user?.userId!;
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
