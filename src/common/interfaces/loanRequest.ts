import { Types } from "mongoose";
import { LoanRequestStatus } from "../types/statusTypes";
export interface ILoanRequest {
    loanOfferId: Types.ObjectId;
    loanRequestId: Types.ObjectId; // Unique identifier for the loan request
    userId:Types.ObjectId; // FK to User (borrower)
    amount: number; // Amount requested for the loan
    interestRate: number; // Interest rate for the loan request
    term: number; // Term of the loan request (e.g., repayment period)
    purpose: string; // The purpose of the loan
    applicationDate: Date; // Date when the loan request was made
    status: LoanRequestStatus; // Status of the loan request (e.g., pending, approved, rejected)
    isDeleted: boolean; // Soft delete flag
}