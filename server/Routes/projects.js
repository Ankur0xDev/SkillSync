import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth, optionalAuth } from '../middleware/auth.js';
import Project from '../models/Project.js';
import User from '../models/user.js';

const router = express.Router();

// Get all public projects
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, technology, featured } = req.query;
    const skip = (page - 1) * limit;

    let query = { isPublic: true };
    
    if (status) query.status = status;
    if (featured === 'true') query.featured = true;
    if (technology) query.technologies = { $in: [technology] };

    const projects = await Project.find(query)
      .populate('user', 'name profilePicture')
      .populate('likes', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's projects
router.get('/my-projects', auth, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id })
      .populate('likes', 'name')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Get my projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single project
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('user', 'name profilePicture bio')
      .populate('likes', 'name')
      .populate('comments.user', 'name profilePicture')
      .populate('collaborators', 'name profilePicture')
      .populate('teamRequests.user', 'name profilePicture')
      .populate('teamMembers.user', 'name profilePicture');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user can view private project
    if (!project.isPublic && (!req.user || project.user._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new project
router.post('/', auth, [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3-100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10-1000 characters'),
  body('githubUrl').isURL().withMessage('Please provide a valid GitHub URL'),
  body('projectUrl').optional().isURL().withMessage('Please provide a valid project URL'),
  body('technologies').isArray({ min: 1 }).withMessage('At least one technology is required'),
  body('status').isIn(['in-progress', 'completed', 'on-hold']).withMessage('Invalid status')
], async (req, res) => {
  try {
    console.log('Creating project with data:', req.body);
    console.log('User:', req.user);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { 
      title, 
      description, 
      githubUrl, 
      projectUrl, 
      technologies, 
      status, 
      isPublic,
      allowTeamRequests,
      maxTeamSize
    } = req.body;

    console.log('Extracted data:', { title, description, githubUrl, projectUrl, technologies, status, isPublic, allowTeamRequests, maxTeamSize });

    const project = new Project({
      user: req.user._id,
      title,
      description,
      githubUrl,
      projectUrl: projectUrl || null,
      technologies,
      status,
      isPublic: isPublic !== undefined ? isPublic : true,
      teamSettings: {
        allowTeamRequests: allowTeamRequests !== undefined ? allowTeamRequests : true,
        maxTeamSize: maxTeamSize || 5,
        requiredSkills: []
      },
      teamMembers: [{
        user: req.user._id,
        role: 'owner',
        skills: []
      }]
    });

    console.log('Project object to save:', project);

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('user', 'name profilePicture')
      .populate('teamMembers.user', 'name profilePicture');

    console.log('Project created successfully:', populatedProject);
    res.status(201).json(populatedProject);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3-100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10-1000 characters'),
  body('githubUrl').optional().isURL().withMessage('Please provide a valid GitHub URL'),
  body('projectUrl').trim().optional({checkFalsy: true}).isURL().withMessage('Please provide a valid project URL'),
  body('technologies').optional().isArray({ min: 1 }).withMessage('At least one technology is required'),
  body('status').optional().isIn(['in-progress', 'completed', 'on-hold']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name profilePicture');

    res.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike project
router.post('/:id/like', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const likeIndex = project.likes.indexOf(req.user._id);
    if (likeIndex > -1) {
      project.likes.splice(likeIndex, 1);
    } else {
      project.likes.push(req.user._id);
    }

    await project.save();
    res.json({ liked: likeIndex === -1, likeCount: project.likes.length });
  } catch (error) {
    console.error('Like project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comments', auth, [
  body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1-500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.comments.push({
      user: req.user._id,
      content: req.body.content
    });

    await project.save();

    const populatedProject = await Project.findById(req.params.id)
      .populate('comments.user', 'name profilePicture');

    const newComment = populatedProject.comments[populatedProject.comments.length - 1];
    res.json(newComment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request to join team
router.post('/:id/team-request', auth, [
  body('message').optional().trim().isLength({ max: 500 }).withMessage('Message must be less than 500 characters'),
  body('skills').isArray({ min: 1 }).withMessage('At least one skill is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const project = await Project.findById(req.params.id)
      .populate('teamRequests.user', 'name profilePicture')
      .populate('teamMembers.user', 'name profilePicture');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user can request to join
    if (!project.canRequestToJoin(req.user._id)) {
      return res.status(400).json({ message: 'Cannot request to join this team' });
    }

    // Add team request
    project.teamRequests.push({
      user: req.user._id,
      message: req.body.message || '',
      skills: req.body.skills
    });

    await project.save();

    const populatedProject = await Project.findById(req.params.id)
      .populate('teamRequests.user', 'name profilePicture')
      .populate('teamMembers.user', 'name profilePicture');

    const newRequest = populatedProject.teamRequests[populatedProject.teamRequests.length - 1];
    res.json(newRequest);
  } catch (error) {
    console.error('Team request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get team requests for a project (project owner only)
router.get('/:id/team-requests', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('teamRequests.user', 'name profilePicture skills')
      .populate('teamMembers.user', 'name profilePicture');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only project owner can view team requests
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(project.teamRequests);
  } catch (error) {
    console.error('Get team requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept team request
router.post('/:id/team-requests/:requestId/accept', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only project owner can accept requests
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const request = project.teamRequests.id(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: 'Team request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    // Check if team is full
    if (project.teamMembers.length >= project.teamSettings.maxTeamSize) {
      return res.status(400).json({ message: 'Team is full' });
    }

    // Accept the request
    request.status = 'accepted';

    // Add user to team members
    project.teamMembers.push({
      user: request.user,
      role: 'member',
      skills: request.skills
    });

    await project.save();

    const populatedProject = await Project.findById(req.params.id)
      .populate('teamRequests.user', 'name profilePicture')
      .populate('teamMembers.user', 'name profilePicture');

    res.json(populatedProject);
  } catch (error) {
    console.error('Accept team request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject team request
router.post('/:id/team-requests/:requestId/reject', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only project owner can reject requests
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const request = project.teamRequests.id(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: 'Team request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    // Reject the request
    request.status = 'rejected';

    await project.save();

    const populatedProject = await Project.findById(req.params.id)
      .populate('teamRequests.user', 'name profilePicture')
      .populate('teamMembers.user', 'name profilePicture');

    res.json(populatedProject);
  } catch (error) {
    console.error('Reject team request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove team member
router.delete('/:id/team-members/:memberId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only project owner can remove team members
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const memberIndex = project.teamMembers.findIndex(
      member => member.user.toString() === req.params.memberId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    // Remove team member
    project.teamMembers.splice(memberIndex, 1);

    await project.save();

    const populatedProject = await Project.findById(req.params.id)
      .populate('teamRequests.user', 'name profilePicture')
      .populate('teamMembers.user', 'name profilePicture');

    res.json(populatedProject);
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's team requests
router.get('/team-requests/my', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      'teamRequests.user': req.user._id
    })
    .populate('user', 'name profilePicture')
    .populate('teamRequests.user', 'name profilePicture')
    .populate('teamMembers.user', 'name profilePicture')
    .sort({ 'teamRequests.createdAt': -1 });

    const userRequests = projects.map(project => {
      const userRequest = project.teamRequests.find(
        request => request.user.toString() === req.user._id.toString()
      );
      return {
        project: {
          _id: project._id,
          title: project.title,
          user: project.user,
          status: project.status
        },
        request: userRequest
      };
    });

    res.json(userRequests);
  } catch (error) {
    console.error('Get user team requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 