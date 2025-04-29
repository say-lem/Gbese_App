import { AuthRequest } from "../../../middleware/auth.middleware";
import LoanRepository from "../data-access/loan.repository";
import LoanService from "../services/loan.service";


export default class CreditLendingController {
    constructor(
        private lenderService: any,
        private creditScoreService: any,
        private loanService: LoanService,
        private loanRepository: LoanRepository,
    ) {}

    async createLoan(req: AuthRequest, res: any) {
        try {
            const userId = req.userId!;
            const { amount, term, interestRate } = req.body;
            const loan = await this.loanRepository.createLoan(userId, amount, term);
            res.status(201).json(loan);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async approveLoan(req: any, res: any) {
        try {
            const { loanId, amount } = req.body;
            const result = await this.lenderService.approveLoan(loanId, amount);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getCreditScore(req: any, res: any) {
        try {
            const { userId } = req.params;
            const creditScore = await this.creditScoreService.getCreditScore(userId);
            res.status(200).json(creditScore);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateCreditScore(req: any, res: any) {
        try {
            const { userId, score } = req.body;
            const updatedCreditScore = await this.creditScoreService.updateCreditScore(userId, score);
            res.status(200).json(updatedCreditScore);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}