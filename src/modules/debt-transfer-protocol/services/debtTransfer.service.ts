import LoanRepository from '../../credit-lending/data-access/loan.repository';
import ApiError from '../../../utils/ApiError';
import { Types } from 'mongoose';

export class DebtTransferService {
  // Upload a loan to the public marketplace
  static async uploadToMarketplace(userId: string, loanId: string) {
    const loan = await LoanRepository.getLoanById(loanId);

    if (!loan) throw new ApiError('Loan not found', 404);
    if (loan.currentHolderId !== userId) throw new ApiError('Unauthorized', 403);
    if (loan.repaymentProgress === 100) throw new ApiError('Loan already repaid', 400);

    await LoanRepository.UpdateLoan(loanId, {
      isUploadedToMarketplace: true,
      transferStatus: null,
      transferTo: null,
    });

    return { message: 'Loan listed on marketplace successfully' };
  }

  // Fetch loans available on marketplace (for browsing)
  static async getMarketplaceLoans() {
    return await LoanRepository.findLoans({
        isUploadedToMarketplace: true,
        transferStatus: null,
        repaymentProgress: { $lt: 100 },
        isDeleted: false,
      });
      
  }

  // Initiate a direct debt transfer to another user
  static async initiateDirectTransfer(currentHolderId: string, loanId: string, newUserId: string) {
    const loan = await LoanRepository.getLoanById(loanId);
    if (!loan) throw new ApiError('Loan not found', 404);
    if (loan.currentHolderId !== currentHolderId) throw new ApiError('Unauthorized', 403);
    if (loan.repaymentProgress === 100) throw new ApiError('Loan already repaid', 400);

    await LoanRepository.UpdateLoan(loanId, {
      transferStatus: 'pending',
      transferTo: newUserId,
      isUploadedToMarketplace: false, // Hide from public
    });

    return { message: 'Debt transfer initiated' };
  }

  // Accept the debt transfer
  static async acceptDebtTransfer(newUserId: string, loanId: string, repayImmediately = false) {
    const loan = await LoanRepository.getLoanById(loanId);
    if (!loan) throw new ApiError('Loan not found', 404);
    if (loan.transferTo !== newUserId) throw new ApiError('Unauthorized', 403);
    if (loan.transferStatus !== 'pending') throw new ApiError('No pending transfer for this loan', 400);

    // Optionally repay immediately logic could go here
    await LoanRepository.UpdateLoan(loanId, {
      currentHolderId: newUserId,
      transferStatus: 'accepted',
      transferTo: null,
      isUploadedToMarketplace: false,
    });

    return {
      message: 'Debt accepted',
      repaymentOption: repayImmediately ? 'immediate' : 'existing timeline',
    };
  }

  // Decline the debt transfer
  static async declineDebtTransfer(newUserId: string, loanId: string) {
    const loan = await LoanRepository.getLoanById(loanId);
    if (!loan) throw new ApiError('Loan not found', 404);
    if (loan.transferTo !== newUserId) throw new ApiError('Unauthorized', 403);
    if (loan.transferStatus !== 'pending') throw new ApiError('No pending transfer', 400);

    await LoanRepository.UpdateLoan(loanId, {
      transferStatus: 'declined',
      transferTo: null,
      isUploadedToMarketplace: false,
    });

    return { message: 'Debt transfer declined' };
  }

  // Optional: Withdraw a loan from marketplace
  static async withdrawFromMarketplace(userId: string, loanId: string) {
    const loan = await LoanRepository.getLoanById(loanId);
    if (!loan) throw new ApiError('Loan not found', 404);
    if (loan.currentHolderId !== userId) throw new ApiError('Unauthorized', 403);

    await LoanRepository.UpdateLoan(loanId, {
      isUploadedToMarketplace: false,
      transferStatus: null,
      transferTo: null,
    });

    return { message: 'Loan withdrawn from marketplace' };
  }
}
