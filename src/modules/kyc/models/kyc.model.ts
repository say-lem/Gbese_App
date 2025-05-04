import mongoose, { Schema, Document, Types } from 'mongoose';
import { IKYCVerification } from '../../../common/interfaces/KYC';

interface IKYCVerificationDocument extends Omit<IKYCVerification, 'userId'>, Document<Types.ObjectId> {
  userId: Types.ObjectId;
}

const kycVerificationSchema = new Schema<IKYCVerificationDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date, default: Date.now },
  rejectionReason: { type: String },
  provider: { type: String },
  metadata: {
        bvn: { type: String },
        nin: { type: String },
        selfieURL: { type: String },
        idType: { type: String },
        idNumber: { type: String }
    },
  isDeleted: { type: Boolean, default: false }
});

const KYCVerificationModel = mongoose.model<IKYCVerificationDocument>('KYCVerification', kycVerificationSchema);
export { KYCVerificationModel, IKYCVerificationDocument };


