import express from 'express';
import User from '../models/user.js';
import { auth } from '../middleware/auth.js';
import { sendEmailNotification } from '../utils/email.js';

const router = express.Router();

// Send connection request
router.post('/send/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if already connected
    const alreadyConnected = currentUser.connections.some(
      conn => conn.user.toString() === userId
    );
    if (alreadyConnected) {
      return res.status(400).json({ message: 'Already connected' });
    }

    // Check if request already sent
    if (currentUser.sentRequests.includes(userId)) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    // Check if request already received from this user
    if (currentUser.receivedRequests.includes(userId)) {
      return res.status(400).json({ message: 'This user has already sent you a request' });
    }

    // Add to sent requests and received requests
    await User.findByIdAndUpdate(currentUserId, {
      $push: { sentRequests: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $push: { receivedRequests: currentUserId }
    });

    // Send email notification to recipient if enabled
    try {
      if (targetUser.notificationSettings?.emailNotifications) {
        await sendEmailNotification({
          to: targetUser.email,
          subject: 'New Connection Request',
          text: `You have received a new connection request from ${currentUser.name}. Please review it in your dashboard.`
        });
      }
    } catch (err) {
      console.error('Failed to send connection request notification email:', err);
    }

    res.json({ message: 'Connection request sent successfully' });
  } catch (error) {
    console.error('Send request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/accept/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    
    // Check if request exists
    if (!currentUser.receivedRequests.includes(userId)) {
      return res.status(400).json({ message: 'No pending request from this user' });
    }

    // Create connection for both users
    const connectionData = {
      user: userId,
      status: 'connected',
      connectedAt: new Date()
    };

    await User.findByIdAndUpdate(currentUserId, {
      $push: { connections: connectionData },
      $pull: { receivedRequests: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $push: { connections: { user: currentUserId, status: 'connected', connectedAt: new Date() } },
      $pull: { sentRequests: currentUserId }
    });

    res.json({ message: 'Connection request accepted' });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject connection request
router.post('/reject/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Remove from received requests and sent requests
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { receivedRequests: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { sentRequests: currentUserId }
    });

    res.json({ message: 'Connection request rejected' });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove connection
router.delete('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Remove connection from both users
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { connections: { user: userId } }
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { connections: { user: currentUserId } }
    });

    res.json({ message: 'Connection removed successfully' });
  } catch (error) {
    console.error('Remove connection error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all connections
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('connections.user', 'name avatar bio skills country lastSeen profilePicture backgroundPicture')
      .populate('sentRequests', 'name avatar bio skills country profilePicture backgroundPicture')
      .populate('receivedRequests', 'name avatar bio skills country profilePicture backgroundPicture');

    res.json({
      connections: user.connections,
      sentRequests: user.sentRequests,
      receivedRequests: user.receivedRequests
    });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;