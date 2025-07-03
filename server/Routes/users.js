import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/user.js';
import PendingUser from '../models/PendingUser.js'
import { auth, optionalAuth } from '../middleware/auth.js';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'skill-sync',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

// Configure multer
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Serve uploaded files
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Upload profile picture
router.post('/upload/profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // console.log('Uploaded file:', req.file);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: req.file.path },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Profile picture uploaded successfully',
      profilePicture: req.file.path
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message
    });
  }
});

// Upload background picture
router.post('/upload/background-picture', auth, upload.single('backgroundPicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // console.log('Uploaded file:', req.file);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { backgroundPicture: req.file.path },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Background picture uploaded successfully',
      backgroundPicture: req.file.path
    });
  } catch (error) {
    console.error('Background picture upload error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message
    });
  }
});

// Delete profile picture
router.delete('/profile-picture', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user.profilePicture) {
      // Extract public_id from Cloudinary URL
      const publicId = user.profilePicture.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    user.profilePicture = '';
    await user.save();

    res.json({ 
      message: 'Profile picture removed successfully',
      profilePicture: ''
    });
  } catch (error) {
    console.error('Profile picture removal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete background picture
router.delete('/background-picture', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user.backgroundPicture) {
      // Extract public_id from Cloudinary URL
      const publicId = user.backgroundPicture.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    user.backgroundPicture = '';
    await user.save();

    res.json({ 
      message: 'Background picture removed successfully',
      backgroundPicture: ''
    });
  } catch (error) {
    console.error('Background picture removal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with filters and search
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      skills,
      country,
      availability,
      experience,
      lookingFor,
      page = 1,
      limit = 12
    } = req.query;

    const query = { isActive: true };
    
    // Exclude current user if authenticated
    if (req.user) {
      query._id = { $ne: req.user._id };
    }

    // Apply privacy settings filter
    if (req.user) {
      // If user is authenticated, respect privacy settings
      const currentUser = await User.findById(req.user._id);
      const userConnectionIds = currentUser.connections.map(conn => conn.user.toString());
      
      query.$or = [
        // Public profiles (including users without privacySettings)
        { 
          $or: [
            { 'privacySettings.profileVisibility': 'public' },
            { 'privacySettings.profileVisibility': { $exists: false } }
          ]
        },
        // Connections only - user must be connected
        {
          'privacySettings.profileVisibility': 'connections',
          _id: { $in: userConnectionIds }
        }
      ];
    } else {
      // If not authenticated, only show public profiles (including users without privacySettings)
      query.$or = [
        { 'privacySettings.profileVisibility': 'public' },
        { 'privacySettings.profileVisibility': { $exists: false } }
      ];
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by skills
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillsArray };
    }

    // Filter by country
    if (country) {
      query.country = new RegExp(country, 'i');
    }

    // Filter by availability
    if (availability) {
      query.availability = availability;
    }

    // Filter by experience
    if (experience) {
      query.experience = experience;
    }

    // Filter by what they're looking for
    if (lookingFor) {
      const lookingForArray = lookingFor.split(',').map(s => s.trim());
      query.lookingFor = { $in: lookingForArray };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(query)
      .select('-password -email -sentRequests -receivedRequests -oauthId')
      .populate('connections.user', 'name profilePicture backgroundPicture')
      .sort({ lastSeen: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers: total,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email -sentRequests -receivedRequests -oauthId')
      .populate('connections.user', 'name profilePicture backgroundPicture')
      .populate('sentRequests', 'name profilePicture backgroundPicture')
      .populate('receivedRequests', 'name profilePicture backgroundPicture');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check privacy settings
    if (req.user) {
      // User is authenticated
      if (req.user._id.toString() === req.params.id) {
        // User viewing their own profile - allow access
      } else {
        // Check privacy settings
        const currentUser = await User.findById(req.user._id);
        const userConnectionIds = currentUser.connections.map(conn => conn.user.toString());
        
        // If user has privacy settings and they're private, block access
        if (user.privacySettings?.profileVisibility === 'private') {
          return res.status(403).json({ message: 'This profile is private and cannot be viewed' });
        }
        
        // If user has privacy settings and they're connections-only, check connection
        if (user.privacySettings?.profileVisibility === 'connections' && 
            !userConnectionIds.includes(req.params.id)) {
          return res.status(403).json({ message: 'This profile is only visible to connections' });
        }
        
        // If user doesn't have privacy settings, treat as public (allow access)
      }
    } else {
      // User is not authenticated - only allow public profiles or users without privacy settings
      if (user.privacySettings?.profileVisibility === 'private' || 
          user.privacySettings?.profileVisibility === 'connections') {
        return res.status(403).json({ message: 'This profile is not publicly visible' });
      }
      // If user doesn't have privacy settings, treat as public (allow access)
    }

    // Increment profile views (but not for the user's own profile)
    if (req.user && req.user._id.toString() !== req.params.id) {
      await User.findByIdAndUpdate(req.params.id, { $inc: { profileViews: 1 } });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}); 
// Update user profile
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('bio').optional().isLength({ max: 500 }),
  body('skills').optional().isArray(),
  body('interests').optional().isArray(),
  body('github').optional().isURL().optional({ nullable: true, checkFalsy: true }),
  body('linkedin').optional().isURL().optional({ nullable: true, checkFalsy: true }),
  body('website').optional().isURL().optional({ nullable: true, checkFalsy: true }),
  body('profilePicture').optional().isURL().optional({ nullable: true, checkFalsy: true }),
  body('backgroundPicture').optional().isURL().optional({ nullable: true, checkFalsy: true })
], async (req, res) => {
  try {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const allowedUpdates = [
      'name', 'bio', 'skills', 'interests', 'github', 'linkedin', 'website',
      'country', 'city', 'timezone', 'availability', 'experience', 'lookingFor', 
      'avatar', 'profilePicture', 'backgroundPicture'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update privacy settings
router.put('/privacy-settings', auth, [
  body('profileVisibility').optional().isIn(['public', 'connections', 'private']),
  body('showOnlineStatus').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { profileVisibility, showOnlineStatus } = req.body;
    const updates = {};

    if (profileVisibility !== undefined) {
      updates['privacySettings.profileVisibility'] = profileVisibility;
    }

    if (showOnlineStatus !== undefined) {
      updates['privacySettings.showOnlineStatus'] = showOnlineStatus;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ 
      message: 'Privacy settings updated successfully', 
      privacySettings: user.privacySettings 
    });
  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user matches/suggestions
router.get('/matches/suggestions', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    // Flag for incomplete profile
    const incompleteProfile =
      !currentUser.skills || currentUser.skills.length === 0 ||
      !currentUser.interests || currentUser.interests.length === 0 ||
      !currentUser.lookingFor || currentUser.lookingFor.length === 0;

    const excludeIds = [
      req.user._id,
      ...currentUser.connections.map(conn => conn.user),
      ...currentUser.sentRequests,
      ...currentUser.receivedRequests
    ];

    // Get user's connection IDs for privacy filtering
    const userConnectionIds = currentUser.connections.map(conn => conn.user.toString());

    const matches = await User.aggregate([
      {
        $match: {
          _id: { $nin: excludeIds },
          isActive: true,
          $or: [
            { skills: { $in: currentUser.skills } },
            { interests: { $in: currentUser.interests } },
            { lookingFor: { $in: currentUser.lookingFor } }
          ],
          // Apply privacy settings filter
          $or: [
            // Public profiles (including users without privacySettings)
            { 
              $or: [
                { 'privacySettings.profileVisibility': 'public' },
                { 'privacySettings.profileVisibility': { $exists: false } }
              ]
            },
            // Connections only - user must be connected
            {
              'privacySettings.profileVisibility': 'connections',
              _id: { $in: userConnectionIds }
            }
          ]
        }
      },
      {
        $addFields: {
          matchScore: {
            $sum: [
              { $size: { $setIntersection: ['$skills', currentUser.skills] } },
              { $size: { $setIntersection: ['$interests', currentUser.interests] } },
              { $size: { $setIntersection: ['$lookingFor', currentUser.lookingFor] } }
            ]
          }
        }
      },
      { $sort: { matchScore: -1, lastSeen: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 1,
          name: 1,
          bio: 1,
          profilePicture: 1,
          backgroundPicture: 1,
          skills: 1,
          interests: 1,
          lookingFor: 1,
          country: 1,
          city: 1,
          availability: 1,
          experience: 1,
          lastSeen: 1,
          matchScore: 1,
          privacySettings: 1
        }
      }
    ]);

    // Respond with matches and optionally a message
    if (incompleteProfile) {
      return res.json({
        message: "Add more skills, interests, or what you're looking for to improve your match results.",
        matches
      });
    }

    res.json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get user stats
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const stats = {
      connections: user.connections.length,
      profileViews: user.profileViews,
      sentRequests: user.sentRequests.length,
      receivedRequests: user.receivedRequests.length
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send account deletion OTP
router.post('/send-deletion-otp', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in user document with expiration
    user.deletionOtp = otp;
    user.deletionOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send email with OTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Confirm Account Deletion - SkillSync',
      text: `You have requested to delete your SkillSync account.\n\nThis action will permanently delete all your data including:\n- Profile information\n- Connections\n- Projects\n- Messages\n- All uploaded files\n\nIf you want to proceed, use this 6-digit OTP: ${otp}\n\nThis OTP expires in 10 minutes.\n\nIf you didn't request this, please ignore this email and your account will remain safe.`
    });

    res.json({ 
      message: 'Account deletion OTP sent successfully. Check your email to confirm deletion.',
      expiresIn: '10 minutes'
    });
  } catch (error) {
    console.error('Send deletion OTP error:', error);
    res.status(500).json({ message: 'Server error while sending deletion OTP' });
  }
});

// Delete user account with OTP verification
router.delete('/account', auth, [
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { otp } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify OTP
    if (!user.deletionOtp || user.deletionOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if OTP has expired
    if (user.deletionOtpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Delete profile picture from Cloudinary if exists
    if (user.profilePicture) {
      try {
        const publicId = user.profilePicture.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Error deleting profile picture:', error);
      }
    }

    // Delete background picture from Cloudinary if exists
    if (user.backgroundPicture) {
      try {
        const publicId = user.backgroundPicture.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Error deleting background picture:', error);
      }
    }

    // Remove user from other users' connections
    await User.updateMany(
      { 'connections.user': req.user._id },
      { $pull: { connections: { user: req.user._id } } }
    );

    // Remove user from sent requests
    await User.updateMany(
      { 'receivedRequests': req.user._id },
      { $pull: { receivedRequests: req.user._id } }
    );

    // Remove user from received requests
    await User.updateMany(
      { 'sentRequests': req.user._id },
      { $pull: { sentRequests: req.user._id } }
    );

    // Delete the user account
    await User.findByIdAndDelete(req.user._id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error while deleting account' });
  }
});

// Change password
router.put('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error while changing password' });
  }
});

// Send verification email
router.post('/send-verification-email', auth, [
  body('email').isEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    const { email } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if email is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Check if there's already a pending verification for this email
    const existingPendingUser = await PendingUser.findOne({ email });
    let otp;
    
    if (existingPendingUser) {
      // Update existing pending user
      otp = Math.floor(100000 + Math.random() * 900000).toString();
      existingPendingUser.otp = otp;
      existingPendingUser.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await existingPendingUser.save();
    } else {
      // Create new pending user
      otp = Math.floor(100000 + Math.random() * 900000).toString();
      const newPendingUser = new PendingUser({
        email: email,
        otp: otp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      });
      await newPendingUser.save();
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Your skillSync OTP verification",
      text: `Your OTP is ${otp}. It expires in 10 minutes`,
    });

    res.json({ 
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    console.error('Send verification email error:', error);
    res.status(500).json({ message: 'Server error while sending verification email' });
  }
});

// Verify email
router.post('/verify-email', auth, [
  body('email').isEmail().withMessage('Please enter a valid email'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { email, otp } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find pending user with the provided email and OTP
    const pendingUser = await PendingUser.findOne({ email, otp });

    if (!pendingUser) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (pendingUser.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Mark email as verified in the main user document
    user.isVerified = true;
    await user.save();

    // Delete the pending user record
    await PendingUser.findByIdAndDelete(pendingUser._id);

    res.json({ 
      message: 'Email verified successfully',
      user: user.getPublicProfile ? user.getPublicProfile() : user
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Server error while verifying email' });
  }
});

// Send change email OTP
router.post('/send-change-email-otp', auth, [
  body('newEmail').isEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    
    const { newEmail } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user's current email is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your current email first' });
    }
    
    // Check if new email is different from current email
    if (newEmail === user.email) {
      return res.status(400).json({ message: 'New email must be different from current email' });
    }
    
    // Check if new email is already in use by another user
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use by another account' });
    }

    // Check if there's already a pending verification for this email
    const existingPendingUser = await PendingUser.findOne({ email: newEmail });
    let otp;
    
    if (existingPendingUser) {
      // Update existing pending user
      otp = Math.floor(100000 + Math.random() * 900000).toString();
      existingPendingUser.otp = otp;
      existingPendingUser.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await existingPendingUser.save();
    } else {
      // Create new pending user
      otp = Math.floor(100000 + Math.random() * 900000).toString();
      const newPendingUser = new PendingUser({
        email: newEmail,
        otp: otp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      });
      await newPendingUser.save();
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: newEmail,
      subject: "Your skillSync Email Change Verification",
      text: `Your OTP for changing email is ${otp}. It expires in 10 minutes`,
    });

    res.json({ 
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    console.error('Send change email OTP error:', error);
    res.status(500).json({ message: 'Server error while sending verification email' });
  }
});

// Change email
router.put('/change-email', auth, [
  body('newEmail').isEmail().withMessage('Please enter a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { newEmail, otp } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user's current email is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your current email first' });
    }

    // Find pending user with the provided email and OTP
    const pendingUser = await PendingUser.findOne({ email: newEmail, otp });

    if (!pendingUser) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (pendingUser.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Update user's email
    user.email = newEmail;
    await user.save();

    // Delete the pending user record
    await PendingUser.findByIdAndDelete(pendingUser._id);

    res.json({ 
      message: 'Email changed successfully',
      user: user.getPublicProfile ? user.getPublicProfile() : user
    });
  } catch (error) {
    console.error('Change email error:', error);
    res.status(500).json({ message: 'Server error while changing email' });
  }
});

// Update notification settings
router.put('/notification-settings', auth, [
  body('emailNotifications').optional().isBoolean().withMessage('emailNotifications must be a boolean'),
  body('connectionRequests').optional().isBoolean().withMessage('connectionRequests must be a boolean'),
  body('projectUpdates').optional().isBoolean().withMessage('projectUpdates must be a boolean'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    const updates = {};
    if (req.body.emailNotifications !== undefined) updates['notificationSettings.emailNotifications'] = req.body.emailNotifications;
    if (req.body.connectionRequests !== undefined) updates['notificationSettings.connectionRequests'] = req.body.connectionRequests;
    if (req.body.projectUpdates !== undefined) updates['notificationSettings.projectUpdates'] = req.body.projectUpdates;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Notification settings updated', notificationSettings: user.notificationSettings });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ message: 'Server error while updating notification settings' });
  }
});

// router.post('/resend-otp',[
//   body('email').isEmail().withMessage('Please Enter a valid email'),
// ],async (req,res)=>{
//   const {email}=req.body;
//   const pendUser=PendingUser.FindOne({email})
//   const existingUser=User.findOne({email})
//     if(!pendUser || !existingUser){
//       return res.status(400).json({message:'user not found'})
//     }
//   if(existingUser.isVerified==='true'){
//     return res.status.json({message:'User is already verified'})
//   }
//   const NewOTP=Math.floor(100000+Math.random()*900000)
//   if(pendUser){
//     pendUser.otp=NewOTP;
//     pendUser.otpExpiresAt=new Date(Date.now()+10*60*1000)
//     await pendUser.save();
//   }else{
//     const newPendingUser=new PendingUser({
//       email,
//       otp:NewOTP,
//     })
//   }
//   const transporter=nodemailer.createTransport({
//     auth:{
//       user:process.env.EMAIL,
//       pass:process.env.EMAIL_PASSWORD
//     }
//   })
//   await transporter.sendMail({
//     from:process.env.EMAIL,
//     to:email,
//     subject:"Your skillSync OTP verification",
//     text:`Your OTP is ${NewOTP}. It expires in 10 minutes`
//   })
//     res.json({message:'OTP sent successfully'}) 
// })

export default router 