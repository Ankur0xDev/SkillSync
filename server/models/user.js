import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.oauthProvider;
    },
    minlength: 6
  },
  profilePicture: {
    type: String,
    default: ''
  },
  backgroundPicture: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  skills: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],
  github: {
    type: String,
    trim: true,
    default: ''
  },
  linkedin: {
    type: String,
    trim: true,
    default: ''
  },
  website: {
    type: String,
    trim: true,
    default: ''
  },
  country: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    trim: true,
    default: ''
  },
  timezone: {
    type: String,
    default: ''
  },
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'weekends', 'flexible'],
    default: 'flexible'
  },
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  lookingFor: [{
    type: String,
    enum: ['hackathon-partner', 'project-collaborator', 'mentor', 'mentee', 'study-buddy']
  }],
  connections: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['connected'],
      default: 'connected'
    },
    connectedAt: {
      type: Date,
      default: Date.now
    }
  }],
  sentRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  receivedRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  profileViews: {
    type: Number,
    default: 0
  },
  oauthProvider: {
    type: String,
    enum: ['google', 'github']
  },
  oauthId: String,
  
  // Chat related fields
  chatRooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  }],
  isOnline: {
    type: Boolean,
    default: false
  },
  unreadMessages: {
    type: Number,
    default: 0
  },
  chatSettings: {
    notifications: {
      type: Boolean,
      default: true
    },
    soundEnabled: {
      type: Boolean,
      default: true
    },
    messagePreview: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Index for better search performance
userSchema.index({ skills: 1 });
userSchema.index({ interests: 1 });
userSchema.index({ country: 1 });
userSchema.index({ availability: 1 });
userSchema.index({ experience: 1 });
userSchema.index({ name: 'text', bio: 'text' });

// Hash password before savin
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last seen
userSchema.methods.updateLastSeen = function() {
  this.lastSeen = new Date();
  return this.save();
};

// Get public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.email;
  delete userObject.sentRequests;
  delete userObject.receivedRequests;
  delete userObject.oauthId;
  return userObject;
};

export default mongoose.model('User', userSchema);