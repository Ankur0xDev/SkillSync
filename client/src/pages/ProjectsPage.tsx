import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter,  
  Code,
} from 'lucide-react';
import { useAuth } from '../Contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { EditProjectModal } from '../components/EditProjectModal';
import { ProjectCard } from '../components/ProjectCard';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import type { Project, UpdateProjectData, TeamRequestData } from '../types';

export const ProjectsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [technologyFilter, setTechnologyFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProjects();
  }, [currentPage, statusFilter, technologyFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      });

      if (statusFilter) params.append('status', statusFilter);
      if (technologyFilter) params.append('technology', technologyFilter);

      const response = await axios.get(`/projects?${params}`);
      setProjects(response.data.projects);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      if (!projectData.projectUrl?.trim()) {
      delete projectData.projectUrl;
    }
      console.log('Creating project with data:', projectData);
      const response = await axios.post('/projects', projectData);
      console.log('Project created successfully:', response.data);
      setProjects(prev => [response.data, ...prev]);
      setShowCreateModal(false);
      toast.success('Project created successfully!');
    } catch (error: any) {
      console.error('Error creating project:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        console.error('Validation errors:', validationErrors);
        validationErrors.forEach((err: any) => {
          toast.error(`${err.path}: ${err.msg}`);
        });
      } else if (error.response?.status === 401) {
        toast.error('Please log in to create a project');
      } else {
        toast.error(error.response?.data?.message || 'Failed to create project');
      }
    }
  };

  const handleLikeProject = async (projectId: string) => {
    try {
      const response = await axios.post(`/projects/${projectId}/like`);
      setProjects(prev => 
        prev.map(project => 
          project._id === projectId 
            ? { 
                ...project, 
                likes: response.data.liked 
                  ? [...project.likes, user!._id]
                  : project.likes.filter(id => id !== user!._id),
                likeCount: response.data.likeCount
              }
            : project
        )
      );
    } catch (error) {
      console.error('Error liking project:', error);
      toast.error('Failed to like project');
    }
  };

  const handleEditProject = async (projectId: string, projectData: UpdateProjectData) => {
    try {
      const response = await axios.put(`/projects/${projectId}`, projectData);
      setProjects(prev => 
        prev.map(project => 
          project._id === projectId ? response.data : project
        )
      );
      setShowEditModal(false);
      setEditingProject(null);
      toast.success('Project updated successfully!');
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast.error(error.response?.data?.message || 'Failed to update project');
    }
  };

  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project);
    setShowEditModal(true);
  };

  const handleTeamRequest = async (projectId: string, data: TeamRequestData) => {
    try {
      const response = await axios.post(`/projects/${projectId}/team-request`, data);
      setProjects(prev => 
        prev.map(project => 
          project._id === projectId 
            ? { ...project, teamRequests: [...project.teamRequests, response.data] }
            : project
        )
      );
      toast.success('Team request sent successfully!');
    } catch (error: any) {
      console.error('Error sending team request:', error);
      toast.error(error.response?.data?.message || 'Failed to send team request');
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.technologies.some(tech => 
      tech.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on-hold', label: 'On Hold' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
              <p className="text-gray-600">
                Discover amazing projects and share your own work
              </p>
            </div>
            {isAuthenticated && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 sm:mt-0 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Share Project</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Filter by technology..."
                  value={technologyFilter}
                  onChange={(e) => setTechnologyFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {searchTerm ? 'No projects found' : 'No projects yet'}
              </h2>
              <p className="text-gray-600 mb-8">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Be the first to share your amazing project!'
                }
              </p>
              {isAuthenticated && !searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Share Your First Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onLike={handleLikeProject}
                  onEdit={handleOpenEditModal}
                  onTeamRequest={handleTeamRequest}
                  index={index}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex justify-center"
          >
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === page
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProject}
        />
      )}

      {/* Edit Project Modal */}
      {showEditModal && editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => {
            setShowEditModal(false);
            setEditingProject(null);
          }}
          onSubmit={handleEditProject}
        />
      )}
    </div>
  );
}; 