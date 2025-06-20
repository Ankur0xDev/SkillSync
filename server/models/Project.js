import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  githubUrl: {
    type: String,
    required: true,
    trim: true
  },
  projectUrl: {
    type: String,
    trim: true,
    default: null
  },
  technologies: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'on-hold'],
    default: 'in-progress'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  featured: {
    type: Boolean,
    default: false
  },
  // Team functionality
  teamRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    skills: [{
      type: String,
      trim: true
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  teamMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    skills: [{
      type: String,
      trim: true
    }]
  }],
  teamSettings: {
    allowTeamRequests: {
      type: Boolean,
      default: true
    },
    maxTeamSize: {
      type: Number,
      default: 5,
      min: 1,
      max: 10
    },
    requiredSkills: [{
      type: String,
      trim: true
    }]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
projectSchema.index({ user: 1, createdAt: -1 });
projectSchema.index({ status: 1, isPublic: 1 });
projectSchema.index({ technologies: 1 });
projectSchema.index({ featured: 1, createdAt: -1 });
projectSchema.index({ 'teamRequests.user': 1 });
projectSchema.index({ 'teamMembers.user': 1 });

// Virtual for like count
projectSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
projectSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for team request count
projectSchema.virtual('pendingTeamRequestsCount').get(function() {
  return this.teamRequests.filter(request => request.status === 'pending').length;
});

// Virtual for team member count
projectSchema.virtual('teamMemberCount').get(function() {
  return this.teamMembers.length;
});

// Method to check if user can request to join team
projectSchema.methods.canRequestToJoin = function(userId) {
  // Only in-progress projects can accept team requests
  if (this.status !== 'in-progress') return false;
  
  // Check if team requests are allowed
  if (!this.teamSettings.allowTeamRequests) return false;
  
  // Check if user is already a team member
  const isMember = this.teamMembers.some(member => member.user.toString() === userId.toString());
  if (isMember) return false;
  
  // Check if user has already sent a request
  const hasRequest = this.teamRequests.some(request => 
    request.user.toString() === userId.toString() && request.status === 'pending'
  );
  if (hasRequest) return false;
  
  // Check if team is full
  if (this.teamMembers.length >= this.teamSettings.maxTeamSize) return false;
  
  return true;
};

// Method to check if user is team member
projectSchema.methods.isTeamMember = function(userId) {
  return this.teamMembers.some(member => member.user.toString() === userId.toString());
};

// Method to check if user is team owner
projectSchema.methods.isTeamOwner = function(userId) {
  return this.teamMembers.some(member => 
    member.user.toString() === userId.toString() && member.role === 'owner'
  );
};

// Ensure virtuals are serialized
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

export default mongoose.model('Project', projectSchema); 