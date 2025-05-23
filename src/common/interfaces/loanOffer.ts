import { Types } from "mongoose";
import { LoanOfferStatus } from "../types/statusTypes";

export interface ILoanOffer {
    loanOfferId: Types.ObjectId; // Unique identifier for the loan offer
    loanRequestId: Types.ObjectId | null; // FK to LoanRequest
    lenderId: Types.ObjectId; // FK to User (lender)
    minLoanAmount: number; // minimum loan ammount to lend out
    maxLoanAmount: number; // Maximum loan amount to lend out
    terms: number; // Terms of the loan offer (e.g., interest rate, repayment period)
    interestRate: number; // Interest rate for the loan offer
    offerDate: Date; // Date when the loan offer was made
    status: LoanOfferStatus; // Status of the loan offer (e.g., pending, accepted, rejected)
    isDeleted: boolean; // Soft delete flag
}