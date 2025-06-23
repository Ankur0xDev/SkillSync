import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, 
  Heart, 
  MessageCircle, 
  Eye, 
  Code,
  Users,
  Star,
  ExternalLink,
  Edit,
  Globe,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../Contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ProjectPreview } from './ProjectPreview';
import { NoPreviewAvailable } from './NoPreviewAvailable';
import { TeamRequestModal } from './TeamRequestModal';
import type { Project, TeamRequestData } from '../types';

interface ProjectCardProps {
  project: Project;
  onLike: (projectId: string) => void;
  onEdit?: (project: Project) => void;
  onTeamRequest?: (projectId: string, data: TeamRequestData) => void;
  index: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onLike, 
  onEdit, 
  onTeamRequest, 
  index 
}) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(project.likes.includes(user?._id || ''));
  const [likeCount, setLikeCount] = useState(project.likeCount);
  const [showPreview, setShowPreview] = useState(false);
  const [showTeamRequest, setShowTeamRequest] = useState(false);
  console.log(user,project)
  const isOwner = user?._id === project.user._id;
  const isTeamMember = project.teamMembers.some(member => member.user._id === user?._id);
  const hasPendingRequest = project.teamRequests.some(
    req => req.user._id === user?._id && req.status === 'pending'
  ); 

  const canRequestToJoin = project.status === 'in-progress' && 
    !isOwner && 
    !isTeamMember && 
    !hasPendingRequest &&
    project.teamSettings.allowTeamRequests &&
    project.teamMemberCount < project.teamSettings.maxTeamSize;

  const handleLike = () => {
    if (!user) return;
    
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike(project._id);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(project);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleTeamRequest = () => {
    setShowTeamRequest(true);
  };

  const handleTeamRequestSubmit = async (projectId: string, data: TeamRequestData) => {
    if (onTeamRequest) {
      await onTeamRequest(projectId, data);
      setShowTeamRequest(false);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              {project.user.profilePicture ? (
                <img 
                  src={project.user.profilePicture} 
                  alt={project.user.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {project.user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{project.user.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(project.status)}`}>
            {getStatusIcon(project.status)}
            <span>{project.status.replace('-', ' ')}</span>
          </span>
        </div>

        {/* Title and Description */}
        <div className="mb-2">
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 line-clamp-2 flex-1">
              {project.title}
            </h2>
            {project.projectUrl && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>Live</span>
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
            {project.description}
          </p>
        </div>

        {/* Technologies */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {project.technologies.slice(0, 3).map((tech, idx) => (
              <span
                key={idx}
                className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                +{project.technologies.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Team Info */}
        {project.teamMemberCount > 0 && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span>{project.teamMemberCount} team member{project.teamMemberCount !== 1 ? 's' : ''}</span>
              {project.pendingTeamRequestsCount > 0 && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {project.pendingTeamRequestsCount} pending request{project.pendingTeamRequestsCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                isLiked 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>
            <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-4 h-4" />
              <span>{project.commentCount}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
              <Eye className="w-4 h-4" />
              <span>{project.likes.length}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isOwner && onEdit && (
              <button
                onClick={handleEdit}
                className="text-gray-500 hover:text-purple-600 transition-colors"
                title="Edit Project"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            {canRequestToJoin && (
              <button
                onClick={handleTeamRequest}
                className="text-blue-500 hover:text-blue-700 transition-colors"
                title="Request to Join Team"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handlePreview}
              className="text-gray-500 hover:text-blue-600 transition-colors"
              title="Preview Project"
            >
              <Globe className="w-5 h-5" />
            </button>
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="View on GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 transition-colors"
                title="View Live Demo"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
            <Link
              to={`/projects/${project._id}`}
              className="text-purple-600 hover:text-purple-700 transition-colors"
              title="View Project Details"
            >
              <Eye className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {project.projectUrl ? (
                <ProjectPreview
                  projectUrl={project.projectUrl}
                  projectTitle={project.title}
                  onClose={() => setShowPreview(false)}
                />
              ) : (
                <NoPreviewAvailable
                  projectTitle={project.title}
                  githubUrl={project.githubUrl}
                  onClose={() => setShowPreview(false)}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Request Modal */}
      <AnimatePresence>
        {showTeamRequest && (
          <TeamRequestModal
            project={project}
            onClose={() => setShowTeamRequest(false)}
            onSubmit={handleTeamRequestSubmit}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}; 