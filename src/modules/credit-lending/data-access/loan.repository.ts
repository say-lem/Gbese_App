export default class LoanRepository {
    constructor(private loanModel: any) {}

    async createLoan(userId: string, amount: number, term: number) {
        const loan = new this.loanModel({
            userId,
            amount,
            term,
            status: 'pending',
            createdAt: new Date(),
        });
        return loan.save();
    }

    async getLoanById(loanId: string) {
        return this.loanModel.findById(loanId).exec();
    }

    async updateLoanStatus(loanId: string, status: string) {
        return this.loanModel.findByIdAndUpdate(
            loanId,
            { status },
            { new: true }
        ).exec();
    }

    async getLoansByUserId(userId: string) {
        return this.loanModel.find({ userId }).exec();
    }
}