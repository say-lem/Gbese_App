import { Types, Document } from "mongoose";

enum FraudType {
    LOGIN = "login",
    TRANSACTION = 'transaction',
    DEBT_TRANSFER = 'debt-transfer'
}

enum FraudStatus {
    PENDING = 'pending',
    RESOLVED = 'resolved',
    FALSE_POSITIVE = 'false positive'
}

interface IFraudDetection extends Document{
    userId: Types.ObjectId;
    transactionId: Types.ObjectId;
    fraudType: FraudType;
    details: object;
    status: FraudStatus;
    reason?: string;
    isDeleted?: boolean;
  }
  
  export { IFraudDetection, FraudType, FraudStatus };