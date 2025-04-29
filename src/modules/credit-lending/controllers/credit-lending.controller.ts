import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../middleware/auth.middleware";
import LoanRepository from "../data-access/loan.repository";
import LoanService from "../services/loan.service";
import LenderService from "../services/lender.service";

export default class CreditLendingController {
	constructor(
		private lenderService: LenderService,
		private creditScoreService: any,
		private loanService: LoanService,
		private loanRepository: LoanRepository
	) {}

	async createNewLoanRequest(req: AuthRequest, res: Response) {
		try {
			const userId = req.userId;
			const { amount, term, interestRate } = req.body;
			const loanRequest = await this.loanRepository.createLoanRequest(userId!, {
				amount,
				term,
				interestRate,
			});
			if (!loanRequest) {
				return res
					.status(400)
					.json({ message: "Failed to create loan request" });
			}
			res.status(201).json(loanRequest);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	async getLoanRequest(req: AuthRequest, res: Response) {
		try {
			const loanRequestId = req.params.loanRequestId;
			const loanRequest = await this.loanRepository.getLoanRequestById(
				loanRequestId
			);
			if (!loanRequest) {
				return res.status(404).json({ message: "Loan request not found" });
			}
			if (loanRequest.isDeleted) {
				return res
					.status(400)
					.json({ message: "Loan request has been deleted" });
			}
			res.status(200).json(loanRequest);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	async getUserLoanRequests(req: AuthRequest, res: Response) {
		try {
			const userId = req.userId;
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 10;
			const loanRequests = await this.loanRepository.getUserLoanRequests(
				userId!,
				page,
				limit
			);
			if (!loanRequests) {
				return res.status(404).json({ message: "No loan requests found" });
			}
			res.status(200).json(loanRequests);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	async createLenderLoanOffer(req: AuthRequest, res: Response) {
		try {
			const { userId, loanRequestId, terms, interestRate } = req.body;
			const loanOffer = await this.lenderService.createLenderLoanOffer(
				userId,
				loanRequestId,
				terms,
				interestRate
			);
			if (!loanOffer) {
				return res.status(400).json({ message: "Failed to create loan offer" });
			}
			res.status(201).json(loanOffer);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	async getLenderLoanOfferById(req: AuthRequest, res: Response) {
		try {
			const userId = req.userId;
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 10;
			const loanOffers = await this.loanRepository.getLoanOfferByLoanRequestId(
				userId!
			);
			if (!loanOffers) {
				return res.status(404).json({ message: "No loan offers found" });
			}
			res.status(200).json(loanOffers);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	async createLoan(req: any, res: any) {
		try {
			const { loanRequestId, lenderId } = req.body;
			if (!lenderId) {
				return res.status(400).json({ message: "Lender ID is required" });
			}
			if (!loanRequestId) {
				return res.status(400).json({ message: "Loan request ID is required" });
			}
			const loanRequest = await this.loanRepository.getLoanRequestById(
				loanRequestId
			);
			if (!loanRequest) {
				return res.status(404).json({ message: "Loan request not found" });
			}
			if (loanRequest.status !== "approved") {
				return res
					.status(400)
					.json({ message: "Loan request is not approved" });
			}
			if (loanRequest.isDeleted) {
				return res
					.status(400)
					.json({ message: "Loan request has been deleted" });
			}
			const data = await this.loanService.createBorrowerLoan(
				lenderId,
				loanRequest!
			);
			res.status(200).json({ message: "Loan created successfully", data });
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	async getLoanById(req: AuthRequest, res: Response) {
		try {
			const { loanId } = req.params;
			const data = await this.loanRepository.getLoanById(loanId);
			if (!data) {
				return res.status(404).json({ message: "Loan not found" });
			}
			res.status(200).json(data);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	async getLenderLoans(req: AuthRequest, res: Response) {
		try {
			const userId = req.userId;
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 10;
			const data = await this.loanRepository.getUserLoans(userId!, page, limit);
			if (!data) {
				return res.status(404).json({ message: "No loans found" });
			}
			res.status(200).json(data);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}
	async getCreditScore(req: AuthRequest, res: Response) {
		try {
			const { userId } = req.params;
			const creditScore = await this.creditScoreService.getCreditScore(userId);
			res.status(200).json(creditScore);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}
}
