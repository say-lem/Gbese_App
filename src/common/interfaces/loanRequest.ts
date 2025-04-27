import { Types } from "mongoose";
export interface ILoanRequest {
    loanRequestId: Types.ObjectId; // Unique identifier for the loan request
    userId:Types.ObjectId; // FK to User (borrower)
    amount: number; // Amount requested for the loan
    interestRate: number; // Interest rate for the loan request
    term: number; // Term of the loan request (e.g., repayment period)
    applicationDate: Date; // Date when the loan request was made
    status: "pending" | "approved" | "rejected"; // Status of the loan request (e.g., pending, approved, rejected)
    isDeleted: boolean; // Soft delete flag
}