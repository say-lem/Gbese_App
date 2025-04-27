import { Schema, Types, model, Document } from "mongoose";
import { ILoan } from "../../../common/interfaces/loan";

interface ILoanDocument extends Omit<ILoan, "loanId">, Document<Types.ObjectId> {}

const loanSchema = new Schema<ILoanDocument>({
	borrowerId: { type: String, ref:"User", required: true },// borrowerId is FK to User(borrower)
	lenderId: { type: String, ref:"User", required: true },// lenderId is FK to User(lender)
	principalAmount: { type: Number, required: true },
	interestRate: { type: Number, required: true },
	term: { type: Number, required: true },
	startDate: { type: Date, required: true },
	endDate: { type: Date, required: true },
	currentHolderId: { type: String, ref:"User", required: true },
	originalBorrowerId: { type: String, ref:"User", required: true },
	repaymentSchedule: [
		{
			dueDate: { type: Date, required: true },
			amountDue: { type: Number, required: true },
		},
	],
	repaymentProgress: { type: Number, required: true },
	isOverdue: { type: Boolean, required: true },
	lastPaymentDate: { type: Date },
	missedPaymentCount: { type: Number },
	tokenId: { type: String },
	repaymentMethod: {
		type: String,
		enum: ["one_time", "schedule_following_original_owner"],
	},
	isDeleted: { type: Boolean, default: false },
}, {
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret._id; // Remove the default _id field
            delete ret.__v; // Remove the version key
        }
    },
    toObject: {
        virtuals: true,
    },
});


loanSchema.virtual("loanId").get(function (this: ILoanDocument) {
    return this._id;
});

const LoanModel = model<ILoanDocument>("Loan", loanSchema);

export {LoanModel, ILoanDocument };