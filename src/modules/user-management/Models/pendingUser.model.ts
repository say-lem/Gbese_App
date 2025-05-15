import mongoose, { Schema } from 'mongoose';

const pendingUserSchema = new Schema({
  username: { type: String, required: true },
  passwordHash: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: String,
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  role: { type: String, enum: ['user', 'admin', 'lender'], default: 'user' }
}, { timestamps: true });


pendingUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PendingUserModel = mongoose.model('PendingUser', pendingUserSchema);
export default PendingUserModel;
