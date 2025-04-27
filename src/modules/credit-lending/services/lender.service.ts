export default class LenderService {
    constructor(
        private lenderRepository: any,
        private loanRepository: any,
        private creditScoreRepository: any
    ) {}

    async approveLoan(loanId: string, amount: number) {
        const loan = await this.loanRepository.getLoanById(loanId);
        if (!loan) {
            throw new Error('Loan not found');
        }

        const creditScore = await this.creditScoreRepository.getCreditScore(loan.userId);
        if (!creditScore || creditScore.score < 600) {
            throw new Error('Insufficient credit score');
        }

        return this.lenderRepository.approveLoan(loanId, amount);
    }
}