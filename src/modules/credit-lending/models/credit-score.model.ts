import { Schema, Types, model, Document } from "mongoose";
import { ICreditScore } from "../../../common/interfaces/creditScore";

interface ICreditScoreDocument extends ICreditScore, Document<Types.ObjectId> {}

const creditScoreSchema = new Schema<ICreditScoreDocument>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // FK to User, PK to CreditScore
    score: { type: Number, required: true },
    lastUpdated: { type: Date, required: true, default: Date.now },
    history: [
        {
            date: { type: Date, required: true },
            score: { type: Number, required: true },
        },
    ],
    timestamp: { type: Date, default: Date.now },
    scoreChange: { type: Number, default: 0 },
    reason: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
}, {
    _id: false,
});


const CreditScoreModel = model<ICreditScoreDocument>("CreditScore", creditScoreSchema);

export { CreditScoreModel, ICreditScoreDocument };
