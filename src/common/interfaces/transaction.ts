export interface ITransaction {
    transactionId?: string;
    userId: string;
    transactionType: string;
    amount: number;
    timestamp: Date;
    status: string;
    details?: object;
    gbeseTokenChange?: number;
    isDeleted?: boolean;
  }
  