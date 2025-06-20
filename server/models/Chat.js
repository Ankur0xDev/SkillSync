import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
    default: 'global'
  },
  messages: [messageSchema],
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastMessage: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
chatSchema.index({ room: 1 });
chatSchema.index({ lastMessage: -1 });
chatSchema.index({ participants: 1 });

export default mongoose.model('Chat', chatSchema); 