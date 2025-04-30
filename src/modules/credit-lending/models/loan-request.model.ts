import { Types, Schema, Document, model } from "mongoose";
import { ILoanRequest } from "../../../common/interfaces/loanRequest";


interface ILoanRequestDocument extends Omit<ILoanRequest, "loanRequestId">, Document<Types.ObjectId> {}

const loanRequestSchema = new Schema<ILoanRequestDocument>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // FK to User (borrower)
    amount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    term: { type: Number, required: true }, // Term of the loan request (e.g., repayment period)
    applicationDate: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: ["pending", "approved", "rejected"], required: true }, // Status of the loan request (e.g., pending, approved, rejected)
    isDeleted: { type: Boolean, default: false }, // Soft delete flag
}, {
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret.id; // Remove the virtual id field
            delete ret._id; // Remove the default _id field
            delete ret.__v; // Remove the version key
            delete ret.isDeleted; // Remove the isDeleted field from the response
        }
    },
    toObject: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret.id; // Remove the virtual id field
        }
    },
});


loanRequestSchema.virtual("loanRequestId").get(function (this: ILoanRequestDocument) {
    return this._id;
});

const LoanRequestModel = model<ILoanRequestDocument>("LoanRequest", loanRequestSchema);
export { LoanRequestModel, ILoanRequestDocument };