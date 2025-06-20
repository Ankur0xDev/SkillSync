import express from 'express';
import { Chat, User } from '../Models/index.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all chats for a user
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name profilePicture')
      .populate('messages.sender', 'name profilePicture')
      .sort({ lastMessage: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific chat
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user._id
    })
      .populate('participants', 'name profilePicture')
      .populate('messages.sender', 'name profilePicture');
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new chat or get existing chat with a user
router.post('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, userId] }
    }).populate('participants', 'name profilePicture');
    
    if (!chat) {
      // Create new chat
      chat = new Chat({
        participants: [req.user._id, userId],
        messages: []
      });
      await chat.save();
      chat = await chat.populate('participants', 'name profilePicture');
    }
    
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a message
router.post('/:chatId/messages', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user._id
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    chat.messages.push({
      sender: req.user._id,
      content
    });
    chat.lastMessage = Date.now();
    await chat.save();
    
    const populatedChat = await chat.populate('messages.sender', 'name profilePicture');
    const newMessage = populatedChat.messages[populatedChat.messages.length - 1];
    
    res.json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 