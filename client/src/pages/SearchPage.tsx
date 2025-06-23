import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../Contexts/ThemeContext';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  X, 
  ChevronDown,
  Users,
  UserPlus,
  Check
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../Contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  bio: string;
  skills: string[];
  interests: string[];
  country: string;
  city: string;
  availability: string;
  experience: string;
  lookingFor: string[];
  lastSeen: string;
  profilePicture?: string;
  backgroundPicture?: string;
}

interface Filters {
  search: string;
  skills: string[];
  country: string;
  availability: string;
  experience: string;
  lookingFor: string[];
}

export const SearchPage: React.FC = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [connections, setConnections] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false
  });

  const [filters, setFilters] = useState<Filters>({
    search: '',
    skills: [],
    country: '',
    availability: '',
    experience: '',
    lookingFor: []
  });

  const [newSkill, setNewSkill] = useState('');

  const availabilityOptions = [
    { value: '', label: 'Any Availability' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'weekends', label: 'Weekends' },
    { value: 'flexible', label: 'Flexible' }
  ];

  const experienceOptions = [
    { value: '', label: 'Any Experience' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];

  const lookingForOptions = [
    { value: 'hackathon-partner', label: 'Hackathon Partner' },
    { value: 'project-collaborator', label: 'Project Collaborator' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'mentee', label: 'Mentee' },
    { value: 'study-buddy', label: 'Study Buddy' }
  ];

  useEffect(() => {
    fetchUsers();
    if (isAuthenticated) {
      fetchSentRequests();
      fetchConnections();
    }
  }, [filters, pagination.currentPage]);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.skills.length > 0) params.append('skills', filters.skills.join(','));
      if (filters.country) params.append('country', filters.country);
      if (filters.availability) params.append('availability', filters.availability);
      if (filters.experience) params.append('experience', filters.experience);
      if (filters.lookingFor.length > 0) params.append('lookingFor', filters.lookingFor.join(','));
      params.append('page', page.toString());

      const response = await axios.get(`/users?${params.toString()}`);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const response = await axios.get('/connections');
      setSentRequests(response.data.sentRequests.map((req: any) => req._id));
    } catch (error) {
      console.error('Error fetching sent requests:', error);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await axios.get('/connections');
      setConnections(response.data.connections.map((conn: any) => conn.user._id));
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const addSkillFilter = () => {
    if (newSkill.trim() && !filters.skills.includes(newSkill.trim())) {
      handleFilterChange('skills', [...filters.skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkillFilter = (skillToRemove: string) => {
    handleFilterChange('skills', filters.skills.filter(skill => skill !== skillToRemove));
  };

  const handleLookingForChange = (value: string, checked: boolean) => {
    const newLookingFor = checked
      ? [...filters.lookingFor, value]
      : filters.lookingFor.filter(item => item !== value);
    handleFilterChange('lookingFor', newLookingFor);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      skills: [],
      country: '',
      availability: '',
      experience: '',
      lookingFor: []
    });
  };

  const sendConnectionRequest = async (userId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to connect with developers');
      return;
    }

    setSendingRequest(userId);
    try {
      await axios.post(`/connections/send/${userId}`);
      toast.success('Connection request sent!');
      setSentRequests(prev => [...prev, userId]);
    } catch (error: any) {
      console.error('Error sending connection request:', error);
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setSendingRequest(null);
    }
  };

  const getExperienceColor = (experience: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-blue-100 text-blue-800',
      advanced: 'bg-purple-100 text-purple-800',
      expert: 'bg-red-100 text-red-800'
    };
    return colors[experience as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getAvailabilityColor = (availability: string) => {
    const colors = {
      'full-time': 'bg-green-100 text-green-800',
      'part-time': 'bg-yellow-100 text-yellow-800',
      'weekends': 'bg-blue-100 text-blue-800',
      'flexible': 'bg-purple-100 text-purple-800'
    };
    return colors[availability as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-b border-gray-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-4xl font-bold mb-4`}>Find Developers</h1>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xl`}>
              Discover talented developers from around the world
            </p>
          </motion.div>
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 mb-6"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, bio, skills..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'} w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-purple-600 text-white'} px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </motion.div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-6 mb-6`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Country */}
                <div>
                  <label className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} block text-sm font-medium mb-2`}>
                    Country
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., United States"
                    value={filters.country}
                    onChange={(e) => handleFilterChange('country', e.target.value)}
                    className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'} w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} block text-sm font-medium mb-2`}>
                    Experience Level
                  </label>
                  <select
                    value={filters.experience}
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                    className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'} w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                  >
                    {experienceOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Availability */}
                <div>
                  <label className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} block text-sm font-medium mb-2`}>
                    Availability
                  </label>
                  <select
                    value={filters.availability}
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                    className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'} w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                  >
                    {availabilityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Skills Filter */}
              <div className="mt-6">
                <label className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} block text-sm font-medium mb-2`}>
                  Skills
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {filters.skills.map((skill, index) => (
                    <span
                      key={index}
                      className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-purple-100 text-purple-800'} px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2`}
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => removeSkillFilter(skill)}
                        className={`${theme === 'dark' ? 'text-gray-100' : 'text-purple-600'} hover:text-purple-800`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add skill filter"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillFilter())}
                    className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'} flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                  />
                  <button
                    onClick={addSkillFilter}
                    className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-purple-600 text-white'} px-4 py-2 rounded-lg hover:bg-purple-700`}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Looking For */}
              <div className="mt-6">
                <label className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} block text-sm font-medium mb-3`}>
                  Looking For
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {lookingForOptions.map(option => (
                    <label key={option.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.lookingFor.includes(option.value)}
                        onChange={(e) => handleLookingForChange(option.value, e.target.checked)}
                        className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-purple-600 text-white'} w-4 h-4 border-gray-300 rounded focus:ring-purple-500`}
                      />
                      <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} text-sm`}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={clearFilters}
                  className={`${theme === 'dark' ? 'text-gray-100' : 'text-purple-600'} hover:text-purple-700 font-medium`}
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          )}

          {/* Results Count */}
          <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
            {pagination.totalUsers} developer{pagination.totalUsers !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-2xl font-bold mb-4`}>No developers found</h2>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
              Try adjusting your search criteria or filters to find more developers.
            </p>
            <button
              onClick={clearFilters}
              className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-purple-600 text-white'} px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors`}
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300`}
                >
                  {/* Header */}
                  <div 
                    className={`relative h-32 ${!user.backgroundPicture ? `${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gradient-to-r from-purple-600 to-blue-600'}` : ''}`}
                  >
                    {user.backgroundPicture ? (
                      <>
                        <img 
                          src={user.backgroundPicture} 
                          alt="background" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30" />
                      </>
                    ) : null}
                    <div className="absolute -bottom-8 left-6">
                      <div className={`w-16 h-16 ${user.profilePicture ? '' : `${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gradient-to-r from-purple-600 to-blue-600'}`} rounded-2xl overflow-hidden border-4 border-white shadow-lg flex items-center justify-center`}>
                        {user.profilePicture ? (
                          <img 
                            src={user.profilePicture} 
                            alt={user.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-white'} text-2xl font-bold`}>
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`absolute top-4 right-4 flex items-center space-x-2 text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-white'}`}>
                      <Clock className="w-3 h-3" />
                      <span>Active recently</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 pt-10">
                    <h3 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-xl font-bold mb-2`}>{user.name}</h3>
                    {(user.country || user.city) && (
                      <div className={`flex items-center space-x-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                        <MapPin className="w-3 h-3" />
                        <span>{user.city ? `${user.city}, ` : ''}{user.country}</span>
                      </div>
                    )}

                    {/* Bio */}
                    {user.bio && (
                      <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'} text-sm mb-4 line-clamp-3`}>
                        {user.bio}
                      </p>
                    )}

                    {/* Tags */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExperienceColor(user.experience)}`}>
                        {user.experience.charAt(0).toUpperCase() + user.experience.slice(1)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(user.availability)}`}>
                        {user.availability.charAt(0).toUpperCase() + user.availability.slice(1)}
                      </span>
                    </div>
                    {/* Skills */}
                    {user.skills.length > 0 && (
                      <div className="mb-4">
                        <h4 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-sm font-medium mb-2`}>Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {user.skills.slice(0, 4).map((skill, idx) => (
                            <span
                              key={idx}
                              className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-purple-100 text-purple-800'} px-2 py-1 rounded text-xs font-medium`}
                            >
                              {skill}
                            </span>
                          ))}
                          {user.skills.length > 4 && (
                            <span className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-600'} px-2 py-1 rounded text-xs`}>
                              +{user.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <Link
                        to={`/profile/${user._id}`}
                        className={`flex-1 ${theme === 'dark' ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} py-3 rounded-lg transition-colors flex items-center justify-center space-x-2`}
                      >
                        <Users className="w-4 h-4" />
                        <span>View Profile</span>
                      </Link>
                      {isAuthenticated && !connections.includes(user._id) && (
                        <button
                          onClick={() => sendConnectionRequest(user._id)}
                          disabled={sendingRequest === user._id || sentRequests.includes(user._id)}
                          className={`flex-1 ${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-purple-600 text-white'} py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {sendingRequest === user._id ? (
                            <LoadingSpinner size="sm" />
                          ) : sentRequests.includes(user._id) ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Sent</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4" />
                              <span>Connect</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-12">
                <button
                  onClick={() => fetchUsers(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className={`px-4 py-2 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50`}
                >
                  Previous
                </button>
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchUsers(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                    className={`px-4 py-2 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};