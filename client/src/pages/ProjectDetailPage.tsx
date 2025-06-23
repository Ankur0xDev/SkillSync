import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../Contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Github, 
  ExternalLink,
  Heart, 
  MessageCircle, 
  Eye, 
  Code,
  Users,
  Star,
  Globe,
  User,
  Send,
  Trash2,
  Edit3,
  UserPlus,
  Crown,
  Shield
} from 'lucide-react';
import { useAuth } from '../Contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EditProjectModal } from '../components/EditProjectModal';
import { ProjectPreview } from '../components/ProjectPreview';
import { NoPreviewAvailable } from '../components/NoPreviewAvailable';
import { TeamRequestModal } from '../components/TeamRequestModal';
import { TeamManagementModal } from '../components/TeamManagementModal';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import type { Project, Comment, UpdateProjectData, TeamRequestData } from '../types';

export const ProjectDetailPage: React.FC = () => {
  const { theme } = useTheme();
    const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTeamRequest, setShowTeamRequest] = useState(false);
  const [showTeamManagement, setShowTeamManagement] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated && !loading) {

      console.warn('User not authenticated, some features may be limited');
    }
  }, [isAuthenticated, loading]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      console.log('Fetching project with ID:', id);
      const response = await axios.get(`/projects/${id}`);
      console.log('Project data received:', response.data);
      setProject(response.data);
      setIsLiked(response.data.likes.includes(user?._id));
      setLikeCount(response.data.likeCount);
    } catch (error: any) {
      console.error('Error fetching project:', error);
      if (error.response?.status === 404) {
        toast.error('Project not found');
      } else if (error.response?.status === 403) {
        toast.error('Access denied to this project');
      } else {
        toast.error('Failed to load project');
      }
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like projects');
      return;
    }

    try {
      const response = await axios.post(`/projects/${id}/like`);
      setIsLiked(response.data.liked);
      setLikeCount(response.data.likeCount);
    } catch (error) {
      console.error('Error liking project:', error);
      toast.error('Failed to like project');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await axios.post(`/projects/${id}/comments`, {
        content: comment
      });
      
      if (project) {
        setProject({
          ...project,
          comments: [...project.comments, response.data],
          commentCount: project.commentCount + 1
        });
      }
      setComment('');
      toast.success('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/projects/${id}`);
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleEditProject = async (projectId: string, projectData: UpdateProjectData) => {
    try {
      const response = await axios.put(`/projects/${projectId}`, projectData);
      setProject(response.data);
      setShowEditModal(false);
      toast.success('Project updated successfully!');
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast.error(error.response?.data?.message || 'Failed to update project');
    }
  };

  const handleTeamRequest = async (projectId: string, data: TeamRequestData) => {
    try {
      const response = await axios.post(`/projects/${projectId}/team-request`, data);
      setProject(prev => prev ? {
        ...prev,
        teamRequests: [...prev.teamRequests, response.data]
      } : null);
      toast.success('Team request sent successfully!');
    } catch (error: any) {
      console.error('Error sending team request:', error);
      toast.error(error.response?.data?.message || 'Failed to send team request');
    }
  };

  const handleAcceptTeamRequest = async (projectId: string, requestId: string) => {
    try {
      const response = await axios.post(`/projects/${projectId}/team-requests/${requestId}/accept`);
      setProject(response.data);
      toast.success('Team request accepted!');
    } catch (error: any) {
      console.error('Error accepting team request:', error);
      toast.error(error.response?.data?.message || 'Failed to accept team request');
    }
  };

  const handleRejectTeamRequest = async (projectId: string, requestId: string) => {
    try {
      const response = await axios.post(`/projects/${projectId}/team-requests/${requestId}/reject`);
      setProject(response.data);
      toast.success('Team request rejected');
    } catch (error: any) {
      console.error('Error rejecting team request:', error);
      toast.error(error.response?.data?.message || 'Failed to reject team request');
    }
  };

  const handleRemoveTeamMember = async (projectId: string, memberId: string) => {
    try {
      const response = await axios.delete(`/projects/${projectId}/team-members/${memberId}`);
      setProject(response.data);
      toast.success('Team member removed');
    } catch (error: any) {
      console.error('Error removing team member:', error);
      toast.error(error.response?.data?.message || 'Failed to remove team member');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'on-hold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-progress':
        return <Code className="w-4 h-4" />;
      case 'completed':
        return <Star className="w-4 h-4" />;
      case 'on-hold':
        return <Users className="w-4 h-4" />;
      default:
        return <Code className="w-4 h-4" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h2>
          <Link to="/projects" className="text-purple-600 hover:text-purple-700">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  // Calculate team-related variables after null check
  const isOwner = user?._id === project?.user?._id;
  const isTeamMember = project?.teamMembers?.some(member => member.user._id === user?._id) || false;
  const hasPendingRequest = project?.teamRequests?.some(
    req => req.user._id === user?._id && req.status === 'pending'
  ) || false;
  const canRequestToJoin = project?.status === 'in-progress' && 
    !isOwner && 
    !isTeamMember && 
    !hasPendingRequest &&
    project?.teamSettings?.allowTeamRequests &&
    (project?.teamMemberCount || 0) < (project?.teamSettings?.maxTeamSize || 5);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            to="/projects"
            className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-100' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </Link>
        </motion.div>

        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden mb-8`}
        >
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                    {project?.user?.profilePicture ? (
                      <img 
                        src={project.user.profilePicture} 
                        alt={project.user.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {project?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{project?.user?.name || 'Unknown User'}</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown date'}
                    </p>
                  </div>
                </div>

                <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
                  {project?.title || 'Untitled Project'}
                  {project?.projectUrl && (
                    <span className={`ml-3 ${theme === 'dark' ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'} px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 inline-flex`}>
                      <Globe className="w-4 h-4" />
                      <span>Live Preview Available</span>
                    </span>
                  )}
                </h1>
                
                <div className="flex items-center space-x-4 mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(project?.status || 'in-progress')}`}>
                    {getStatusIcon(project?.status || 'in-progress')}
                    <span>{(project?.status || 'in-progress').replace('-', ' ')}</span>
                  </span>
                  
                  <div className={`flex items-center space-x-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{project?.likes?.length || 0} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{likeCount} likes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{project?.commentCount || 0} comments</span>
                    </div>
                  </div>
                </div>

                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed mb-6`}>{project?.description || 'No description available'}</p>

                {/* Technologies */}
                <div className="mb-6">
                  <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Technologies Used</h3>
                  <div className="flex flex-wrap gap-2">
                    {project?.technologies?.map((tech, idx) => (
                      <span
                        key={idx}
                        className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    )) || <span className="text-gray-500">No technologies specified</span>}
                  </div>
                </div>

                {/* Team Section */}
                {(project?.teamMemberCount || 0) > 0 && (
                  <div className="mb-6">
                    <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Team Members</h3>
                    <div className='flex  justify-between'>
                    <div className="space-y-3">
                      {project?.teamMembers?.map((member) => (
                        <div key={member._id} className="flex items-center space-x-3">
                          <div className={`w-8 h-8 ${theme === 'dark' ? 'bg-gradient-to-r from-green-600 to-blue-600' : 'bg-gradient-to-r from-green-600 to-blue-600'} rounded-full flex items-center justify-center`}>
                            {member?.user?.profilePicture ? (
                              <img 
                                src={member.user.profilePicture} 
                                alt={member.user.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span className="text-white font-bold text-xs">
                                {member?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                              <span className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{member?.user?.name || 'Unknown User'}</span>
                            {getRoleIcon(member?.role || 'member')}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      {isOwner && (project?.pendingTeamRequestsCount || 0) > 0 && (
                    <button
                      onClick={() => setShowTeamManagement(true)}
                      className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      <span>Manage Team ({project.pendingTeamRequestsCount})</span>
                    </button>
                  )}
                    </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowPreview(true)}
                    className={`flex items-center space-x-2 px-4 py-1 rounded-lg transition-colors ${
                      project?.projectUrl 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span className='text-sm'>{project?.projectUrl ? 'Preview' : 'No Preview'}</span>
                  </button>
                  
                  {/* Team Dashboard Button - Only for team members */}
                  {(isOwner || isTeamMember) && (
                    <Link
                      to={`/team-dashboard/${project?._id}`}
                      className={`flex items-center space-x-4 ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'} px-4 py-1 rounded-lg hover:bg-indigo-700 transition-colors`}
                    >
                      <Users className="w-4 h-4" />
                      <span className='text-sm'>Team Dashboard</span>
                    </Link>
                  )}
                  
                  {canRequestToJoin && (
                    <button
                      onClick={() => setShowTeamRequest(true)}
                      className={`flex items-center space-x-2 ${theme === 'dark' ? 'bg-green-600 text-white' : 'bg-green-600 text-white'}  py-1 rounded-lg hover:bg-green-700 transition-colors`}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Join Team</span>
                    </button>
                  )}

                  

                  <a
                    href={project?.githubUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center space-x-4 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-900 text-white'} px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors`}
                  >
                    <Github className="w-4 h-4" />
                    <span className='text-sm'>View on GitHub</span>
                  </a>
                  
                  {project?.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center space-x-2 ${theme === 'dark' ? 'bg-green-600 text-white' : 'bg-green-600 text-white'} px-4 py-2 rounded-lg hover:bg-green-700 transition-colors`}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Live Demo</span>
                    </a>
                  )}

                  {isAuthenticated && (
                    <button
                      onClick={handleLike}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        isLiked 
                          ? `${theme === 'dark' ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-600'} hover:bg-red-200` 
                          : `${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-700'} hover:bg-gray-200`
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{isLiked ? 'Liked' : 'Like'}</span>
                    </button>
                  )}

                  {isOwner && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowEditModal(true)}
                        className={`flex items-center space-x-2 ${theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'} px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors`}
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={handleDeleteProject}
                            className={`flex items-center space-x-2 ${theme === 'dark' ? 'bg-red-600 text-white' : 'bg-red-600 text-white'} px-4 py-2 rounded-lg hover:bg-red-700 transition-colors`}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-8`}
        >
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-6`}>Comments ({project?.commentCount || 0})</h2>

          {/* Add Comment */}
          {isAuthenticated && (
            <form onSubmit={handleComment} className="mb-8">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className={`w-full px-4 py-3 ${theme === 'dark' ? 'border border-gray-700 text-gray-100' : 'border border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingComment || !comment.trim()}
                  className={`px-6 py-3 ${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-purple-600 text-white'} rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
                >
                  {submittingComment ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {(project?.comments?.length || 0) === 0 ? (
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-center py-8`}>No comments yet. Be the first to comment!</p>
            ) : (
              project?.comments?.map((comment: Comment) => (
                <div key={comment._id} className="flex space-x-4">
                        <div className={`w-10 h-10 ${theme === 'dark' ? 'bg-gradient-to-r from-green-600 to-blue-600' : 'bg-gradient-to-r from-purple-600 to-blue-600'} rounded-full flex items-center justify-center flex-shrink-0`}>
                    {comment?.user?.profilePicture ? (
                      <img 
                        src={comment.user.profilePicture} 
                        alt={comment.user.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-white font-bold text-sm">
                        {comment?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{comment?.user?.name || 'Unknown User'}</span>
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {comment?.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Unknown date'}
                      </span>
                    </div>
                      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{comment?.content || 'No content'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Edit Project Modal */}
      {showEditModal && project && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditProject}
        />
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && project && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
              className={`fixed inset-0 ${theme === 'dark' ? 'bg-gray-900' : 'bg-black'} bg-opacity-50 flex items-center justify-center p-4 z-50`}
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
                className={`w-full max-w-4xl max-h-[90vh] overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
              onClick={(e) => e.stopPropagation()}
            >
              {project?.projectUrl ? (
                <ProjectPreview
                  projectUrl={project.projectUrl}
                  projectTitle={project?.title || 'Project'}
                  onClose={() => setShowPreview(false)}
                />
              ) : (
                <NoPreviewAvailable
                  projectTitle={project?.title || 'Project'}
                  githubUrl={project?.githubUrl || '#'}
                  onClose={() => setShowPreview(false)}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Request Modal */}
      <AnimatePresence>
        {showTeamRequest && project && (
          <TeamRequestModal
            project={project}
            onClose={() => setShowTeamRequest(false)}
            onSubmit={handleTeamRequest}
          />
        )}
      </AnimatePresence>

      {/* Team Management Modal */}
      <AnimatePresence>
        {showTeamManagement && project && (
          <TeamManagementModal
            project={project}
            onClose={() => setShowTeamManagement(false)}
            onAcceptRequest={handleAcceptTeamRequest}
            onRejectRequest={handleRejectTeamRequest}
            onRemoveMember={handleRemoveTeamMember}
          />
        )}
      </AnimatePresence>
    </div>
  );
}; 