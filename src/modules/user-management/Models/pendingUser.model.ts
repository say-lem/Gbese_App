import mongoose, { Schema } from 'mongoose';

const pendingUserSchema = new Schema({
  username: { type: String, required: true },
  passwordHash: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: String,
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

const PendingUserModel = mongoose.model('PendingUser', pendingUserSchema);
export default PendingUserModel;
