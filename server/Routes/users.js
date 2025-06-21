import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/user.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';

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

    const matches = await User.aggregate([
      {
        $match: {
          _id: { $nin: excludeIds },
          isActive: true,
          $or: [
            { skills: { $in: currentUser.skills } },
            { interests: { $in: currentUser.interests } },
            { lookingFor: { $in: currentUser.lookingFor } }
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
          matchScore: 1
        }
      }
    ]);

    // Respond with matches and optionally a message
    if (incompleteProfile) {
      return res.json({
        message: 'Add more skills, interests, or what you’re looking for to improve your match results.',
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

// Delete user account
router.delete('/account', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete profile picture from Cloudinary if exists
    if (user.profilePicture) {
      const publicId = user.profilePicture.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete background picture from Cloudinary if exists
    if (user.backgroundPicture) {
      const publicId = user.backgroundPicture.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(publicId);
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

export default router 