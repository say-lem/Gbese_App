export interface ILoan {
    loanId?: string;
    borrowerId: string;
    lenderId: string;
    principalAmount: number;
    interestRate: number;
    term: number;
    startDate: Date;
    endDate: Date;
    currentHolderId: string;
    originalBorrowerId: string;
    repaymentSchedule: IRepaymentSchedule[];
    repaymentProgress: number;
    isOverdue: boolean;
    lastPaymentDate?: Date;
    missedPaymentCount?: number;
    tokenId?: string;
    repaymentMethod?: 'one_time' | 'schedule_following_original_owner';
    isDeleted?: boolean;
  }
  
  export interface IRepaymentSchedule {
    dueDate: Date;
    amountDue: number;
    status?: "Paid"| "Not Paid"|"Overdue";
  }
  