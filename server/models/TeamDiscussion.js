import mongoose from 'mongoose';

const teamDiscussionSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  hashtags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    fileType: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['general', 'frontend', 'backend', 'design', 'bug', 'feature', 'question'],
    default: 'general'
  }
}, {
  timestamps: true
});

// Index for better search performance
teamDiscussionSchema.index({ project: 1, createdAt: -1 });
teamDiscussionSchema.index({ hashtags: 1 });
teamDiscussionSchema.index({ category: 1 });

export default mongoose.model('TeamDiscussion', teamDiscussionSchema); 