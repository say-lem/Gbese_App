export default class LoanService {
    constructor(
        private loanRepository: any,
        private creditScoreRepository: any,
        private userRepository: any
    ) {}

    async applyForLoan(userId: string, amount: number, term: number) {
        const user = await this.userRepository.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const creditScore = await this.creditScoreRepository.getCreditScore(userId);
        if (!creditScore || creditScore.score < 600) {
            throw new Error('Insufficient credit score');
        }

        return this.loanRepository.createLoan(userId, amount, term);
    }
}