
import mongoose from 'mongoose';

const pendingUserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // store hashed password
  otp: String,
  otpExpiresAt: Date
});

export default mongoose.model('PendingUser', pendingUserSchema);
