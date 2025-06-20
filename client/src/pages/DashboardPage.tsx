import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Heart, 
  Eye, 
  UserPlus, 
  Search, 
  TrendingUp,
  ArrowRight,
  Bell,
  Activity
} from 'lucide-react';
import { useAuth } from '../Contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import axios from 'axios';

interface DashboardStats {
  connections: number;
  profileViews: number;
  sentRequests: number;
  receivedRequests: number;
}

interface RecentConnection {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
    skills: string[];
  };
  connectedAt: string;
}

interface PendingRequest {
  _id: string;
  name: string;
  avatar: string;
  skills: string[];
  bio: string;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    connections: 0,
    profileViews: 0,
    sentRequests: 0,
    receivedRequests: 0
  });
  const [recentConnections, setRecentConnections] = useState<RecentConnection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, connectionsResponse] = await Promise.all([
        axios.get('/users/stats/overview'),
        axios.get('/connections')
      ]);

      setStats(statsResponse.data);
      
      const connectionsData = connectionsResponse.data;
      setRecentConnections(connectionsData.connections.slice(0, 5));
      setPendingRequests(connectionsData.receivedRequests.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (userId: string) => {
    try {
      await axios.post(`/connections/accept/${userId}`);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const rejectRequest = async (userId: string) => {
    try {
      await axios.post(`/connections/reject/${userId}`);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Connections',
      value: stats.connections,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      link: '/connections'
    },
    {
      title: 'Profile Views',
      value: stats.profileViews,
      icon: Eye,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      link: '/profile'
    },
    {
      title: 'Sent Requests',
      value: stats.sentRequests,
      icon: UserPlus,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      link: '/connections'
    },
    {
      title: 'Pending Requests',
      value: stats.receivedRequests,
      icon: Bell,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      link: '/connections'
    }
  ];

  const quickActions = [
    {
      title: 'Find Matches',
      description: 'Discover developers who complement your skills',
      icon: Heart,
      color: 'bg-pink-500',
      link: '/matches'
    },
    {
      title: 'Search Developers',
      description: 'Browse and filter through our community',
      icon: Search,
      color: 'bg-blue-500',
      link: '/search'
    },
    {
      title: 'Edit Profile',
      description: 'Update your skills and preferences',
      icon: Users,
      color: 'bg-purple-500',
      link: '/profile/edit'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your SkillSync profile
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={stat.link}
                  className="block bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.title}
                      to={action.link}
                      className="p-6 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                    >
                      <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent Connections */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recent Connections</h2>
                <Link
                  to="/connections"
                  className="text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              {recentConnections.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No connections yet</p>
                  <Link
                    to="/matches"
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Find your first match
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentConnections.map((connection) => (
                    <div
                      key={connection._id}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {connection.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900">
                          {connection.user.name}
                        </h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {connection.user.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(connection.connectedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Pending Requests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pending Requests
              </h3>
              
              {pendingRequests.length === 0 ? (
                <div className="text-center py-6">
                  <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {request.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {request.name}
                          </h4>
                          {request.bio && (
                            <p className="text-xs text-gray-600 truncate">
                              {request.bio}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => acceptRequest(request._id)}
                          className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => rejectRequest(request._id)}
                          className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                  <Link
                    to="/connections"
                    className="block text-center text-purple-600 hover:text-purple-700 font-medium text-sm"
                  >
                    View All Requests
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Profile Completion */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5" />
                <h3 className="font-semibold">Boost Your Profile</h3>
              </div>
              <p className="text-purple-100 text-sm mb-4">
                Complete your profile to get better matches and more connections.
              </p>
              <Link
                to="/profile/edit"
                className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors inline-block"
              >
                Edit Profile
              </Link>
            </motion.div>

            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Profile viewed {stats.profileViews} times</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">{stats.connections} active connections</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">{stats.sentRequests} requests sent</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};