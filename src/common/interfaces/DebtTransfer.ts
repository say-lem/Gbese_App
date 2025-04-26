export interface IDebtTransferRequest {
    transferRequestId?: string;
    originalDebtorId: string;
    newDebtorId: string;
    loanId: string;
    incentive?: number;
    requestDate: Date;
    status: 'pending' | 'accepted' | 'rejected';
    newDebtorCreditScore?: number;
    acceptedCount?: number;
    rejectedCount?: number;
    transferFrequency?: number;
    tokenId?: string;
    repaymentMethod?: 'one_time' | 'schedule_following_original_owner';
    isDeleted?: boolean;
  }
