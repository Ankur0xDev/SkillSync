
import mongoose from 'mongoose';

const pendingUserSchema = new mongoose.Schema({
  name:{
    type:String,
    default:null
  } ,
  email: { type: String, unique: true,required:true },
  password:{
    type:String, // store hashed password
    default:null
  } ,
  otp: {
    type:String,
    required:true
  },
  otpExpiresAt: Date
});

export default mongoose.model('PendingUser', pendingUserSchema);
