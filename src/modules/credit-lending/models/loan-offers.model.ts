import { Schema, Types, model, Document } from "mongoose";
import { ILoanOffer } from "../../../common/interfaces/loanOffer";


interface ILoanOfferDocument extends ILoanOffer, Document {}

const loanOfferSchema = new Schema<ILoanOfferDocument>({
    loanRequestId: { type: Schema.Types.ObjectId, ref: "LoanRequest", default: null}, // FK to LoanRequest
    lenderId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // FK to User (lender)
    terms: { type: Number, required: true }, // Terms of the loan offer (repayment period in months)
    minLoanAmount:  {type: Number, required: true },
    maxLoanAmount:  {type: Number, required: true},
    interestRate: { type: Number, required: true }, // Interest rate for the loan offer
    offerDate: { type: Date, required: true },
    status: { type: String, enum: ["open", "accepted", "suspended", "closed"], required: true }, // Status of the loan offer (e.g., open, accepted, suspended, closed)
    isDeleted: { type: Boolean, default: false }, // Soft delete flag
}, {
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret.id; // Remove the virtual id field
            delete ret._id; // Remove the default _id field
            delete ret.__v; // Remove the version key
        }
    },
    toObject: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret.id; // Remove the virtual id field
            delete ret._id // Remove the default _id field
        }
    },
});


loanOfferSchema.virtual("loanOfferId").get(function (this: ILoanOfferDocument) {
    return this._id;
});

const LoanOfferModel = model<ILoanOfferDocument>("LoanOffer", loanOfferSchema);
export { LoanOfferModel, ILoanOfferDocument };