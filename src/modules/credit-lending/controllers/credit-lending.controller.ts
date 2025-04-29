import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../middleware/auth.middleware";
import LoanRepository from "../data-access/loan.repository";
import LoanService from "../services/loan.service";
import LenderService from "../services/lender.service";
import CreditScoreService from "../services/credit-score.service";

export default class CreditLendingController {
	private static lenderService: LenderService;
	private static creditScoreService: CreditScoreService;
	private static loanService: LoanService;
	private static loanRepository: LoanRepository;

	static async createNewLoanRequest(req: AuthRequest, res: Response) {
		try {
			const userId = req.userId;
			const { amount, term, interestRate } = req.body;
			const loanRequest = await this.loanRepository.createLoanRequest(userId!, {
				amount,
				term,
				interestRate,
			});
			if (!loanRequest) {
				res.status(400).json({ message: "Failed to create loan request" });
				return;
			}
			res.status(201).json(loanRequest);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	static async getLoanRequest(req: AuthRequest, res: Response) {
		try {
			const loanRequestId = req.params.loanRequestId;
			const loanRequest = await this.loanRepository.getLoanRequestById(
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
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	static async getUserLoanRequests(req: AuthRequest, res: Response) {
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
				res.status(404).json({ message: "No loan requests found" });
				return;
			}
			res.status(200).json(loanRequests);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	static async createLenderLoanOffer(req: AuthRequest, res: Response) {
		try {
			const { userId, loanRequestId, terms, interestRate } = req.body;
			const loanOffer = await this.lenderService.createLenderLoanOffer(
				userId,
				loanRequestId,
				terms,
				interestRate
			);
			if (!loanOffer) {
				res.status(400).json({ message: "Failed to create loan offer" });
				return;
			}
			res.status(201).json(loanOffer);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	static async getLoanOfferById(req: AuthRequest, res: Response) {
		try {
			const { loanOfferId } = req.params;
			const data = await this.loanRepository.getLoanOfferById(
				loanOfferId
			);
			if (!data) {
				res.status(404).json({ message: "No loan offers found" });
				return;
			}
			res.status(200).json(data);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

    static  async getLoanOfferByRequestId(req: AuthRequest, res: Response) {
        try {
            const { loanRequestId } = req.params;
            const data = await this.loanRepository.getLoanOfferByLoanRequestId(loanRequestId);
            if (!data) {
                res.status(404).json({ message: "Loan offer not found" });
                return;
            }
            res.status(200).json(data);
        }
        catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

	static async createLoan(req: AuthRequest, res: Response) {
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
			const loanRequest = await this.loanRepository.getLoanRequestById(
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
			const data = await this.loanService.createBorrowerLoan(
				lenderId,
				loanRequest!
			);
			res.status(200).json({ message: "Loan created successfully", data });
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	static async getLoanById(req: AuthRequest, res: Response) {
		try {
			const { loanId } = req.params;
			const data = await this.loanRepository.getLoanById(loanId);
			if (!data) {
                res.status(404).json({ message: "Loan not found" });
                return;
			}
			res.status(200).json(data);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	static async getLenderLoans(req: AuthRequest, res: Response) {
		try {
			const userId = req.userId;
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 10;
			const data = await this.loanRepository.getUserLoans(userId!, page, limit);
			if (!data) {
				res.status(404).json({ message: "No loans found" });
                return;
			}
			res.status(200).json(data);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	static async getCreditScoreByUserId(req: AuthRequest, res: Response) {
		try {
			const { userId } = req.params;
			const creditScore = await this.creditScoreService.getCreditScore(userId);
			res.status(200).json(creditScore);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}
}
