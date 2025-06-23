import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../Contexts/ThemeContext';
import { 
  MessageSquare, 
  CheckSquare, 
  BarChart3, 
  Users, 
  Clock,
  TrendingUp,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../Contexts/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import type { 
  DashboardOverview, 
  TeamDiscussion, 
  Task, 
  CreateDiscussionData,
  CreateTaskData 
} from '../types/teamDashboard';
import { DiscussionModal } from '../components/DiscussionModal';
import { TaskModal } from '../components/TaskModal';
import { TaskBoard } from '../components/TaskBoard';
import { DiscussionList } from '../components/DiscussionList';

export const TeamDashboardPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'discussions' | 'tasks'>('overview');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [discussions, setDiscussions] = useState<TeamDiscussion[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedHashtag, setSelectedHashtag] = useState<string>('');

  useEffect(() => {
    if (projectId) {
      fetchDashboardData();
    }
  }, [projectId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, discussionsRes, tasksRes] = await Promise.all([
        axios.get(`/team-dashboard/project/${projectId}/overview`),
        axios.get(`/team-dashboard/project/${projectId}/discussions`),
        axios.get(`/team-dashboard/project/${projectId}/tasks`)
      ]);

      setOverview(overviewRes.data);
      setDiscussions(discussionsRes.data.discussions);
      setTasks(tasksRes.data);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async (data: CreateDiscussionData) => {
    try {
      const response = await axios.post(`/team-dashboard/project/${projectId}/discussions`, data);
      setDiscussions(prev => [response.data, ...prev]);
      setShowDiscussionModal(false);
      toast.success('Discussion created successfully!');
    } catch (error: any) {
      console.error('Error creating discussion:', error);
      toast.error(error.response?.data?.message || 'Failed to create discussion');
    }
  };

  const handleCreateTask = async (data: CreateTaskData) => {
    try {
      const response = await axios.post(`/team-dashboard/project/${projectId}/tasks`, data);
      setTasks(prev => [response.data, ...prev]);
      setShowTaskModal(false);
      toast.success('Task created successfully!');
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleLikeDiscussion = async (discussionId: string) => {
    try {
      const response = await axios.post(`/team-dashboard/discussions/${discussionId}/like`);
      setDiscussions(prev => 
        prev.map(discussion => 
          discussion._id === discussionId 
            ? { 
                ...discussion, 
                likes: response.data.liked 
                  ? [...discussion.likes, user!._id]
                  : discussion.likes.filter(id => id !== user!._id)
              }
            : discussion
        )
      );
    } catch (error) {
      console.error('Error liking discussion:', error);
      toast.error('Failed to like discussion');
    }
  };

  const handleReplyToDiscussion = async (discussionId: string, content: string) => {
    try {
      const response = await axios.post(`/team-dashboard/discussions/${discussionId}/reply`, { content });
      setDiscussions(prev => 
        prev.map(discussion => 
          discussion._id === discussionId 
            ? { ...discussion, replies: [...discussion.replies, response.data] }
            : discussion
        )
      );
      toast.success('Reply added successfully!');
    } catch (error: any) {
      console.error('Error adding reply:', error);
      toast.error(error.response?.data?.message || 'Failed to add reply');
    }
  };

  const handleUpdateTask = async (taskId: string, data: any) => {
    try {
      const response = await axios.put(`/team-dashboard/tasks/${taskId}`, data);
      setTasks(prev => 
        prev.map(task => 
          task._id === taskId ? response.data : task
        )
      );
      toast.success('Task updated successfully!');
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-200 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Project not found</h2>
          <Link to="/projects" className={`${theme === 'dark' ? 'text-purple-600' : 'text-purple-600'} hover:text-purple-700`}>
            Back to Projects
          </Link>
        </div>

      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/projects"
                className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-gray-100 hover:text-gray-900' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Projects</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{overview.project.title}</h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-500'}`}>Team Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-500'}`}>
                <Users className="w-4 h-4" />
                <span>{overview.project.teamMembers.length} members</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm border mb-8`}>
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('overview')}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? `${theme === 'dark' ? 'border-purple-500 text-purple-600' : 'border-purple-500 text-purple-600'}`
                  : `${theme === 'dark' ? 'text-gray-100' : 'text-gray-500'} border-transparent `
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('discussions')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'discussions'
                  ? 'border-purple-500 text-purple-600'
                  : `${theme === 'dark' ? 'text-gray-100' : 'text-gray-500'} border-transparent `
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Discussions</span>
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tasks'
                  ? 'border-purple-500 text-purple-600'
                  : `${theme === 'dark' ? 'text-gray-100' : 'text-gray-500'} border-transparent `
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Task Board</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm border p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>Total Tasks</p>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                        {overview.taskStats.todo + overview.taskStats.inProgress + overview.taskStats.review + overview.taskStats.done}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <CheckSquare className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm border p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>In Progress</p>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-blue-600'}`}>{overview.taskStats.inProgress}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm border p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>Completed</p>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-green-600'}`}>{overview.taskStats.done}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm border p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>Discussions</p>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-purple-600'}`}>{discussions.length}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Discussions */}
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm border`}>
                  <div className="flex items-center justify-between p-6 border-b">
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Recent Discussions</h3>
                    <button
                      onClick={() => setShowDiscussionModal(true)}
                      className={`flex items-center space-x-2 ${theme === 'dark' ? 'bg-purple-600' : 'bg-purple-600'} text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>New</span>
                    </button>
                  </div>
                  <div className="p-6">
                    {overview.recentDiscussions.length === 0 ? (
                      <p className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-500'} text-center py-8`}>No discussions yet</p>
                    ) : (
                      <div className="space-y-4">
                        {overview.recentDiscussions.map((discussion) => (
                          <div key={discussion._id} className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              {discussion.author.profilePicture ? (
                                <img 
                                  src={discussion.author.profilePicture} 
                                  alt={discussion.author.name}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <span className="text-white font-bold text-xs">
                                  {discussion.author.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} truncate`}>
                                {discussion.title}
                              </p>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-100' : 'text-gray-500'}`}>
                                by {discussion.author.name} • {new Date(discussion.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Tasks */}
                  <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-sm border`}>
                  <div className="flex items-center justify-between p-6 border-b">
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Recent Tasks</h3>
                    <button
                      onClick={() => setShowTaskModal(true)}
                            className={`flex items-center space-x-2 ${theme === 'dark' ? 'bg-green-600' : 'bg-green-600'} text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>New</span>
                    </button>
                  </div>
                  <div className="p-6">
                    {overview.recentTasks.length === 0 ? (
                      <p className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-500'} text-center py-8`}>No tasks yet</p>
                    ) : (
                      <div className="space-y-4">
                        {overview.recentTasks.map((task) => (
                          <div key={task._id} className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <CheckSquare className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} truncate`}>
                                {task.title}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                  {task.status}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'discussions' && (
            <motion.div
              key="discussions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DiscussionList
                discussions={discussions}
                onLike={handleLikeDiscussion}
                onReply={handleReplyToDiscussion}
                onCreateDiscussion={() => setShowDiscussionModal(true)}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedHashtag={selectedHashtag}
                setSelectedHashtag={setSelectedHashtag}
              />
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TaskBoard
                tasks={tasks}
                onCreateTask={() => setShowTaskModal(true)}
                onUpdateTask={handleUpdateTask}
                projectMembers={overview.project.teamMembers}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDiscussionModal && (
          <DiscussionModal
            onClose={() => setShowDiscussionModal(false)}
            onSubmit={handleCreateDiscussion}
            projectId={projectId!}
          />
        )}
        {showTaskModal && (
          <TaskModal
            onClose={() => setShowTaskModal(false)}
            onSubmit={(data) => {
              if (
                typeof data.title === 'string' &&
                typeof data.description === 'string' &&
                typeof data.status === 'string' &&
                typeof data.priority === 'string'
              ) {
                handleCreateTask(data as CreateTaskData);
              } else {
                console.error('Invalid data for creating task', data);
              }
            }}
            projectId={projectId!}
            projectMembers={overview.project.teamMembers}
          />
        )}
      </AnimatePresence>
    </div>
  );
}; 