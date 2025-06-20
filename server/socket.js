import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/user.js';
import Chat from './models/Chat.js';

const processedMessages = new Set();

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000' ||'https://skill-sync-lime.vercel.app/',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log('User connected:', socket.user.name);

    // Update user's online status
    await User.findByIdAndUpdate(socket.user._id, { isOnline: true });

    // Join global room
    socket.join('global');

    // Send previous messages
    const globalChat = await Chat.findOne({ room: 'global' })
      .populate('messages.user', 'name profilePicture')
      .sort({ 'messages.timestamp': -1 })
      .limit(50);

    if (globalChat) {
      socket.emit('previousMessages', globalChat.messages.reverse());
    }

    // Handle new messages
    socket.on('message', async (data) => {
      try {
        // Check if message was already processed
        if (processedMessages.has(data.messageId)) {
          return;
        }

        // Add to processed messages
        processedMessages.add(data.messageId);

        const { content, room = 'global' } = data;

        // Create message object
        const message = {
          user: socket.user._id,
          content,
          timestamp: new Date()
        };

        // Save message to database
        let chat = await Chat.findOne({ room });
        
        if (!chat) {
          chat = new Chat({
            room,
            messages: [message],
            participants: [socket.user._id]
          });
        } else {
          chat.messages.push(message);
          if (!chat.participants.includes(socket.user._id)) {
            chat.participants.push(socket.user._id);
          }
        }

        chat.lastMessage = new Date();
        await chat.save();

        // Populate user details for the message
        const populatedMessage = {
          id: chat.messages[chat.messages.length - 1]._id,
          user: {
            _id: socket.user._id,
            name: socket.user.name,
            profilePicture: socket.user.profilePicture
          },
          content,
          timestamp: message.timestamp
        };

        // Broadcast message to room
        io.to(room).emit('message', populatedMessage);

        // Update unread messages count for other users
        const otherUsers = await User.find({
          _id: { $ne: socket.user._id },
          'chatSettings.notifications': true
        });

        for (const user of otherUsers) {
          await User.findByIdAndUpdate(user._id, {
            $inc: { unreadMessages: 1 }
          });
        }

        // Remove from processed messages after 5 seconds
        setTimeout(() => {
          processedMessages.delete(data.messageId);
        }, 5000);
      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle get messages request
    socket.on('getMessages', async (callback) => {
      try {
        const chat = await Chat.findOne({ room: 'global' })
          .populate('messages.user', 'name profilePicture')
          .sort({ 'messages.timestamp': -1 })
          .limit(50);

        if (chat) {
          callback(chat.messages.reverse());
        } else {
          callback([]);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        callback([]);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.user.name);
      await User.findByIdAndUpdate(socket.user._id, {
        isOnline: false,
        lastSeen: new Date()
      });
    });
  });

  return io;
}; 