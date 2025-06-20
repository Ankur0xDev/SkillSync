import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth.js';
import TeamDiscussion from '../models/TeamDiscussion.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, document, and archive files are allowed!'));
    }
  }
});

// Helper function to check if user is team member
const isTeamMember = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return false;
  
  return project.teamMembers.some(member => member.user.toString() === userId.toString()) ||
         project.user.toString() === userId.toString();
};

// Get project dashboard overview
router.get('/project/:projectId/overview', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    if (!await isTeamMember(projectId, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [project, discussions, tasks] = await Promise.all([
      Project.findById(projectId)
        .populate('user', 'name profilePicture')
        .populate('teamMembers.user', 'name profilePicture'),
      TeamDiscussion.find({ project: projectId })
        .populate('author', 'name profilePicture')
        .populate('replies.author', 'name profilePicture')
        .sort({ isPinned: -1, createdAt: -1 })
        .limit(5),
      Task.find({ project: projectId })
        .populate('assignee', 'name profilePicture')
        .populate('createdBy', 'name profilePicture')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    const taskStats = {
      todo: await Task.countDocuments({ project: projectId, status: 'todo' }),
      inProgress: await Task.countDocuments({ project: projectId, status: 'in-progress' }),
      review: await Task.countDocuments({ project: projectId, status: 'review' }),
      done: await Task.countDocuments({ project: projectId, status: 'done' })
    };

    res.json({
      project,
      recentDiscussions: discussions,
      recentTasks: tasks,
      taskStats
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Team Discussions Routes
router.get('/project/:projectId/discussions', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { category, hashtag, page = 1, limit = 20 } = req.query;
    
    if (!await isTeamMember(projectId, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = { project: projectId };
    if (category && category !== 'all') query.category = category;
    if (hashtag) query.hashtags = hashtag;

    const discussions = await TeamDiscussion.find(query)
      .populate('author', 'name profilePicture')
      .populate('replies.author', 'name profilePicture')
      .populate('likes', 'name')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await TeamDiscussion.countDocuments(query);

    res.json({
      discussions,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Get discussions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/project/:projectId/discussions', auth, [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3-200 characters'),
  body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('Content must be between 1-5000 characters'),
  body('category').isIn(['general', 'frontend', 'backend', 'design', 'bug', 'feature', 'question']).withMessage('Invalid category'),
  body('hashtags').optional().isArray().withMessage('Hashtags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { projectId } = req.params;
    const { title, content, category, hashtags } = req.body;
    
    if (!await isTeamMember(projectId, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const discussion = new TeamDiscussion({
      project: projectId,
      author: req.user._id,
      title,
      content,
      category,
      hashtags: hashtags || []
    });

    await discussion.save();

    const populatedDiscussion = await TeamDiscussion.findById(discussion._id)
      .populate('author', 'name profilePicture');

    res.status(201).json(populatedDiscussion);
  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/discussions/:discussionId/like', auth, async (req, res) => {
  try {
    const discussion = await TeamDiscussion.findById(req.params.discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    if (!await isTeamMember(discussion.project, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const likeIndex = discussion.likes.indexOf(req.user._id);
    if (likeIndex > -1) {
      discussion.likes.splice(likeIndex, 1);
    } else {
      discussion.likes.push(req.user._id);
    }

    await discussion.save();
    res.json({ liked: likeIndex === -1, likeCount: discussion.likes.length });
  } catch (error) {
    console.error('Like discussion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/discussions/:discussionId/reply', auth, [
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Reply must be between 1-2000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const discussion = await TeamDiscussion.findById(req.params.discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    if (!await isTeamMember(discussion.project, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    discussion.replies.push({
      author: req.user._id,
      content: req.body.content
    });

    await discussion.save();

    const populatedDiscussion = await TeamDiscussion.findById(discussion._id)
      .populate('author', 'name profilePicture')
      .populate('replies.author', 'name profilePicture');

    const newReply = populatedDiscussion.replies[populatedDiscussion.replies.length - 1];
    res.json(newReply);
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Tasks Routes
router.get('/project/:projectId/tasks', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, assignee, priority } = req.query;
    
    if (!await isTeamMember(projectId, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = { project: projectId };
    if (status) query.status = status;
    if (assignee) query.assignee = assignee;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query)
      .populate('assignee', 'name profilePicture')
      .populate('createdBy', 'name profilePicture')
      .populate('comments.author', 'name profilePicture')
      .sort({ priority: -1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/project/:projectId/tasks', auth, [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3-200 characters'),
  body('description').trim().isLength({ min: 1, max: 2000 }).withMessage('Description must be between 1-2000 characters'),
  body('status').isIn(['todo', 'in-progress', 'review', 'done']).withMessage('Invalid status'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('assignee').optional().isMongoId().withMessage('Invalid assignee ID'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
  body('estimatedHours').optional().isNumeric().withMessage('Estimated hours must be a number'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { projectId } = req.params;
    const { title, description, status, priority, assignee, dueDate, estimatedHours, tags } = req.body;
    
    if (!await isTeamMember(projectId, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const task = new Task({
      project: projectId,
      title,
      description,
      status,
      priority,
      assignee,
      createdBy: req.user._id,
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
      tags: tags || []
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name profilePicture')
      .populate('createdBy', 'name profilePicture');

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/tasks/:taskId', auth, [
  body('title').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3-200 characters'),
  body('description').optional().trim().isLength({ min: 1, max: 2000 }).withMessage('Description must be between 1-2000 characters'),
  body('status').optional().isIn(['todo', 'in-progress', 'review', 'done']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('assignee').optional().isMongoId().withMessage('Invalid assignee ID'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
  body('actualHours').optional().isNumeric().withMessage('Actual hours must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!await isTeamMember(task.project, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.taskId,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignee', 'name profilePicture')
     .populate('createdBy', 'name profilePicture');

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/tasks/:taskId/comment', auth, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1-1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!await isTeamMember(task.project, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.comments.push({
      author: req.user._id,
      content: req.body.content
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name profilePicture')
      .populate('createdBy', 'name profilePicture')
      .populate('comments.author', 'name profilePicture');

    const newComment = populatedTask.comments[populatedTask.comments.length - 1];
    res.json(newComment);
  } catch (error) {
    console.error('Add task comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// File Upload Routes
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: fileUrl,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'File upload failed' });
  }
});

// Get hashtags for a project
router.get('/project/:projectId/hashtags', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    if (!await isTeamMember(projectId, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const hashtags = await TeamDiscussion.aggregate([
      { $match: { project: mongoose.Types.ObjectId(projectId) } },
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json(hashtags);
  } catch (error) {
    console.error('Get hashtags error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 