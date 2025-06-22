import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.js';

dotenv.config();

const migrateUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find users with corrupted verificationOtp fields
    const usersWithCorruptedOtp = await User.find({
      $or: [
        { verificationOtp: { $type: 'object' } },
        { verificationOtpExpiresAt: { $type: 'object' } },
        { deletionOtp: { $type: 'object' } },
        { deletionOtpExpiresAt: { $type: 'object' } }
      ]
    });

    console.log(`Found ${usersWithCorruptedOtp.length} users with corrupted OTP fields`);

    // Fix each user
    for (const user of usersWithCorruptedOtp) {
      console.log(`Fixing user: ${user.email}`);
      
      // Reset corrupted fields to null
      if (typeof user.verificationOtp === 'object') {
        user.verificationOtp = null;
      }
      if (typeof user.verificationOtpExpiresAt === 'object') {
        user.verificationOtpExpiresAt = null;
      }
      if (typeof user.deletionOtp === 'object') {
        user.deletionOtp = null;
      }
      if (typeof user.deletionOtpExpiresAt === 'object') {
        user.deletionOtpExpiresAt = null;
      }

      // Save the user
      await user.save();
      console.log(`Fixed user: ${user.email}`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run the migration
migrateUsers(); 