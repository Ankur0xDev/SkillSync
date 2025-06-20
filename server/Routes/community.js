import express from 'express';
import User from '../models/user.js';
import Post from '../models/Post.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all posts
router.get('/posts', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Get trending topics
router.get('/trending', auth, async (req, res) => {
  try {
    const posts = await Post.find();
    const tagCounts = {};

    // Count occurrences of each tag
    posts.forEach(post => {
      post.tags.forEach(tag => {
        if (!tagCounts[tag]) {
          tagCounts[tag] = {
            count: 0,
            posts: 0
          };
        }
        tagCounts[tag].count++;
        tagCounts[tag].posts++;
      });
    });

    // Convert to array and sort by count
    const trendingTopics = Object.entries(tagCounts)
      .map(([tag, data]) => ({
        tag,
        count: data.count,
        posts: data.posts
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json(trendingTopics);
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    res.status(500).json({ message: 'Error fetching trending topics' });
  }
});

// Get active users
router.get('/active-users', auth, async (req, res) => {
  try {
    const activeUsers = await User.find()
      .select('name profilePicture skills lastSeen')
      .sort({ lastSeen: -1 })
      .limit(10);

    // Get post count for each user
    const usersWithPostCount = await Promise.all(
      activeUsers.map(async (user) => {
        const postCount = await Post.countDocuments({ user: user._id });
        return {
          ...user.toObject(),
          postCount
        };
      })
    );

    res.json(usersWithPostCount);
  } catch (error) {
    console.error('Error fetching active users:', error);
    res.status(500).json({ message: 'Error fetching active users' });
  }
});

// Create a new post
router.post('/posts', auth, async (req, res) => {
  try {
    const { content, tags } = req.body;
    const post = new Post({
      user: req.user._id,
      content,
      tags: tags || []
    });

    await post.save();
    await post.populate('user', 'name profilePicture');

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Like a post
router.post('/posts/:postId/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.likes += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Error liking post' });
  }
});

// Add a comment to a post
router.post('/posts/:postId/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// Share a post
router.post('/posts/:postId/share', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.shares += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error('Error sharing post:', error);
    res.status(500).json({ message: 'Error sharing post' });
  }
});

export default router; 