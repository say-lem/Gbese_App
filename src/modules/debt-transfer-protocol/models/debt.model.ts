import mongoose, { Schema, Document, Types } from 'mongoose';
import { IDebtTransferRequest } from '../../../common/interfaces/DebtTransfer';

interface IDebtTransferRequestDocument extends Omit<IDebtTransferRequest, 'DebtTransferId'>, Document<Types.ObjectId> {}

const DebtTransferSchema = new Schema<IDebtTransferRequestDocument>({
    transferRequestId: { type: String, required: true },
    originalDebtorId: { type: String, required: true },
    newDebtorId: { type: String, required: true },
    loanId: { type: String, required: true },
    incentive: { type: Number, },
    requestDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    newDebtorCreditScore: { type: Number },
    acceptedCount: { type: Number },
    rejectedCount: { type: Number },
    transferFrequency: { type: Number },
    tokenId: { type: String, required: true },
    repaymentMethod: { type: String, enum: ['one_time', 'schedule_following_original_owner'], default: 'one_time' },
    isDeleted: { type: Boolean, default: false }
});

const DebtTransferModel = mongoose.model<IDebtTransferRequest>('DebtTransfer', DebtTransferSchema);

export { DebtTransferModel, IDebtTransferRequest };
