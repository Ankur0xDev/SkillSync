import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../Contexts/ThemeContext';
import { 
  X, 
  Calendar,
  Clock,
  User,
  Send,
  AlertCircle,
  CheckCircle,
  Clock as ClockIcon
} from 'lucide-react';
import { SkillInput } from './SkillInput';
import type { CreateTaskData, UpdateTaskData } from '../types/teamDashboard';

interface TaskModalProps {
  onClose: () => void;
  onSubmit: (data: CreateTaskData | UpdateTaskData) => void | Promise<void>;
  projectId: string;
  projectMembers: any[]; //ts-ignpore
  task?: any;//ts-ignore
}

export const TaskModal: React.FC<TaskModalProps> = ({ 
  onClose, 
  onSubmit, 
  // projectId, 
  projectMembers,
  task 
}) => {
  const isEditing = !!task;
  const { theme } = useTheme();
  const [formData, setFormData] = useState<CreateTaskData>({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    assignee: task?.assignee?._id || '',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    estimatedHours: task?.estimatedHours || undefined,
    tags: task?.tags || [],
    attachments: task?.attachments || []
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof CreateTaskData, value: any) => {//ts-ignore
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 1) {
      newErrors.description = 'Description cannot be empty';
    }

    if (formData.estimatedHours && formData.estimatedHours < 0) {
      newErrors.estimatedHours = 'Estimated hours must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error creating/updating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: <ClockIcon className="w-4 h-4" /> },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800', icon: <AlertCircle className="w-4 h-4" /> },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-4 h-4" /> }
  ];

  const statuses = [
    { value: 'todo', label: 'To Do', color: 'bg-gray-200 text-gray-800' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'review', label: 'Review', color: 'bg-purple-100 text-purple-800' },
    { value: 'done', label: 'Done', color: 'bg-green-100 text-green-800' }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 ${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button
              onClick={onClose}
                className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-400'} hover:text-gray-600 transition-colors`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                Task Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-4 py-3 border border-white ${theme === 'dark' ? 'border-gray-700 text-gray-100' : 'border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="What needs to be done?"
              />
              {errors.title && (
                <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-red-100' : 'text-red-600'}`}>{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 border border-white ${theme === 'dark' ? 'border-gray-700 text-gray-100' : 'border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the task in detail..."
              />
              {errors.description && (
                <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-red-100' : 'text-red-600'}`}>{errors.description}</p>
              )}
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status */}
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {statuses.map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => handleInputChange('status', status.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.status === status.value
                          ? status.color
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-400'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                  Priority
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {priorities.map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => handleInputChange('priority', priority.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
                        formData.priority === priority.value
                          ? priority.color
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {priority.icon}
                      <span>{priority.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Assignee and Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assignee */}
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                  Assignee
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={formData.assignee}
                    onChange={(e) => handleInputChange('assignee', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border border-white ${theme === 'dark' ? 'border-gray-700 text-gray-100' : 'border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                  >
                    <option value="">Unassigned</option>
                    {projectMembers.map((member) => (
                      <option key={member.user._id} value={member.user._id}>
                        {member.user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                  Due Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border border-white ${theme === 'dark' ? 'border-gray-700 text-gray-100' : 'border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                  />
                </div>
              </div>
            </div>

            {/* Estimated Hours */}
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                Estimated Hours
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimatedHours || ''}
                  onChange={(e) => handleInputChange('estimatedHours', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className={`w-full pl-10 pr-4 py-3 border border-white ${theme === 'dark' ? 'border-gray-700 text-gray-100' : 'border-gray-300 text-gray-900'}    rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.estimatedHours ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 4.5"
                />
              </div>
              {errors.estimatedHours && (
                <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-red-100' : 'text-red-600'}`}>{errors.estimatedHours}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                Tags
              </label>
              <SkillInput
                skills={formData.tags || []}
                onSkillsChange={(tags) => handleInputChange('tags', tags)}
                placeholder="Add tags (e.g., frontend, bug, feature)"
                // icon={<Tag className="w-4 h-4" />}
              />
              <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-100' : 'text-gray-500'}`}>
                Use tags to categorize and organize tasks
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                      className={`flex-1 px-6 py-3 border border-gray-300 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} rounded-lg hover:bg-gray-50 transition-colors`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{isEditing ? 'Update Task' : 'Create Task'}</span>
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