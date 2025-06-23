import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../Contexts/ThemeContext';
import { 
  X, 
  Github, 
  Eye,
  EyeOff,
  Save,
  ExternalLink
} from 'lucide-react';
import { SkillInput } from './SkillInput';
import type { Project, UpdateProjectData } from '../types';

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSubmit: (projectId: string, data: UpdateProjectData) => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({ project, onClose, onSubmit }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<UpdateProjectData>({
    title: project.title,
    description: project.description,
    githubUrl: project.githubUrl,
    projectUrl: project.projectUrl || '',
    technologies: project.technologies,
    status: project.status,
    isPublic: project.isPublic
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when project changes
  useEffect(() => {
    setFormData({
      title: project.title,
      description: project.description,
      githubUrl: project.githubUrl,
      projectUrl: project.projectUrl || '',
      technologies: project.technologies,
      status: project.status,
      isPublic: project.isPublic
    });
  }, [project]);

  const handleInputChange = (field: keyof UpdateProjectData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.githubUrl?.trim()) {
      newErrors.githubUrl = 'GitHub URL is required';
    } else if (!isValidGitHubUrl(formData.githubUrl)) {
      newErrors.githubUrl = 'Please enter a valid GitHub repository URL';
    }

    if (formData.projectUrl && !isValidUrl(formData.projectUrl)) {
      newErrors.projectUrl = 'Please enter a valid project URL';
    }

    if (!formData.technologies || formData.technologies.length === 0) {
      newErrors.technologies = 'At least one technology is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidGitHubUrl = (url: string) => {
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w-]+(\/)?$/;
    return githubRegex.test(url);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(project._id, formData);
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 ${theme === 'dark' ? 'bg-gray-900' : 'bg-black'} bg-opacity-50 flex items-center justify-center p-4 z-50`}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 ${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Edit Project</h2>
            <button
              onClick={onClose}
              className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-100' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                Project Title *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-4 py-3 ${theme === 'dark' ? 'border border-gray-700 text-gray-100' : 'border border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your project title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                Description *
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 ${theme === 'dark' ? 'border border-gray-700 text-gray-100' : 'border border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe your project, what it does, and what you learned..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* GitHub URL */}
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                GitHub Repository URL *
              </label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="url"
                  value={formData.githubUrl || ''}
                  onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 ${theme === 'dark' ? 'border border-gray-700 text-gray-100' : 'border border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.githubUrl ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://github.com/username/repository"
                />
              </div>
              {errors.githubUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.githubUrl}</p>
              )}
            </div>

            {/* Project URL */}
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                Live Demo / Project URL (Optional)
              </label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="url"
                  value={formData.projectUrl || ''}
                  onChange={(e) => handleInputChange('projectUrl', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 ${theme === 'dark' ? 'border border-gray-700 text-gray-100' : 'border border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.projectUrl ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://your-project-demo.com"
                />
              </div>
              {errors.projectUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.projectUrl}</p>
              )}
                <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Add a link to your live demo, deployed app, or project website
              </p>
            </div>

            {/* Technologies */}
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                Technologies Used *
              </label>
              <SkillInput
                skills={formData.technologies || []}
                onSkillsChange={(technologies) => handleInputChange('technologies', technologies)}
                placeholder="Add technologies (e.g., React, Node.js, MongoDB)"
              />
              {errors.technologies && (
                <p className="mt-1 text-sm text-red-600">{errors.technologies}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                Project Status
              </label>
              <select
                value={formData.status || 'in-progress'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className={`w-full px-4 py-3 ${theme === 'dark' ? 'border border-gray-700 text-gray-100' : 'border border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
              >
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>

            {/* Visibility */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isPublic !== undefined ? formData.isPublic : true}
                  onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div className="flex items-center space-x-2">
                  {formData.isPublic ? (
                    <Eye className="w-4 h-4 text-gray-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-600" />
                  )}
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>
                    Make this project public
                  </span>
                </div>
              </label>
              <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Public projects are visible to everyone. Private projects are only visible to you.
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 px-6 py-3 ${theme === 'dark' ? 'border border-gray-700 text-gray-100' : 'border border-gray-300 text-gray-700'} rounded-lg hover:bg-gray-50 transition-colors`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 px-6 py-3 ${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-purple-600 text-white'} rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
              >
                {isSubmitting ? (
                  <>
                      <div className={`w-4 h-4 border-2 ${theme === 'dark' ? 'border-gray-100' : 'border-white'} border-t-transparent rounded-full animate-spin`} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 