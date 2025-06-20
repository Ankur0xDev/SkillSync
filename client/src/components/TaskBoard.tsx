import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MoreVertical, 
  Calendar,
  Clock,
  User,
  Tag,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  X
} from 'lucide-react';
import type { Task, UpdateTaskData } from '../types/teamDashboard';

interface TaskBoardProps {
  tasks: Task[];
  onCreateTask: () => void;
  onUpdateTask: (taskId: string, data: UpdateTaskData) => void;
  projectMembers: any[]; //ts-ignore
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ 
  tasks, 
  onCreateTask, 
  // onUpdateTask, 
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100 text-gray-800' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { id: 'review', title: 'Review', color: 'bg-purple-100 text-purple-800' },
    { id: 'done', title: 'Done', color: 'bg-green-100 text-green-800' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-3 h-3" />;
      case 'high': return <AlertCircle className="w-3 h-3" />;
      case 'medium': return <ClockIcon className="w-3 h-3" />;
      case 'low': return <CheckCircle className="w-3 h-3" />;
      default: return <ClockIcon className="w-3 h-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  // const handleStatusChange = (taskId: string, newStatus: string) => {
  //   onUpdateTask(taskId, { status: newStatus as any });
  // };

  const openTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Task Board</h2>
        <button
          onClick={onCreateTask}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => {
          const columnTasks = tasks.filter(task => task.status === column.id);
          
          return (
            <div key={column.id} className="bg-white rounded-lg shadow-sm border">
              {/* Column Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${column.color}`}>
                    {column.title}
                  </span>
                  <span className="text-sm text-gray-500">({columnTasks.length})</span>
                </div>
              </div>

              {/* Tasks */}
              <div className="p-4 space-y-3 min-h-[400px]">
                {columnTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">No tasks</p>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <motion.div
                      key={task._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                      onClick={() => openTaskDetails(task)}
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                          {task.title}
                        </h3>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Task Meta */}
                      <div className="space-y-2">
                        {/* Priority */}
                        <div className="flex items-center space-x-1">
                          {getPriorityIcon(task.priority)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>

                        {/* Assignee */}
                        {task.assignee && (
                          <div className="flex items-center space-x-2">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-600">{task.assignee.name}</span>
                          </div>
                        )}

                        {/* Due Date */}
                        {task.dueDate && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className={`text-xs ${
                              new Date(task.dueDate) < new Date() ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                        )}

                        {/* Estimated Hours */}
                        {task.estimatedHours && (
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-600">{task.estimatedHours}h</span>
                          </div>
                        )}

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <Tag className="w-3 h-3 text-gray-400" />
                            <div className="flex flex-wrap gap-1">
                              {task.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="px-1 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                              {task.tags.length > 2 && (
                                <span className="text-xs text-gray-500">+{task.tags.length - 2}</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Comments */}
                        {task.comments && task.comments.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-600">{task.comments.length} comments</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Details Modal */}
      <AnimatePresence>
        {showTaskDetails && selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowTaskDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedTask.title}</h2>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTask.priority)}`}>
                        {selectedTask.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        columns.find(col => col.id === selectedTask.status)?.color
                      }`}>
                        {selectedTask.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTaskDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-900">{selectedTask.description}</p>
                  </div>

                  {/* Task Details */}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTask.assignee && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-1">Assignee</h3>
                        <p className="text-gray-900">{selectedTask.assignee.name}</p>
                      </div>
                    )}
                    {selectedTask.dueDate && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-1">Due Date</h3>
                        <p className="text-gray-900">{new Date(selectedTask.dueDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {selectedTask.estimatedHours && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-1">Estimated Hours</h3>
                        <p className="text-gray-900">{selectedTask.estimatedHours}h</p>
                      </div>
                    )}
                    {selectedTask.actualHours && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-1">Actual Hours</h3>
                        <p className="text-gray-900">{selectedTask.actualHours}h</p>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {selectedTask.tags && selectedTask.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTask.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  {selectedTask.comments && selectedTask.comments.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Comments ({selectedTask.comments.length})</h3>
                      <div className="space-y-3">
                        {selectedTask.comments.map((comment) => (
                          <div key={comment._id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">{comment.author.name}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};  
