import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Check, 
  X, 
  Search,
  MapPin,
  Calendar,
  Mail
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Connection {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
    bio: string;
    skills: string[];
    country: string;
    lastSeen: string;
    profilePicture: string;
    backgroundPicture: string;
  };
  status: string;
  connectedAt: string;
}

interface PendingRequest {
  _id: string;
  name: string;
  avatar: string;
  bio: string;
  skills: string[];
  country: string;
  profilePicture: string;
  backgroundPicture: string;
}

export const ConnectionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'connections' | 'sent' | 'received'>('connections');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [sentRequests, setSentRequests] = useState<PendingRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await axios.get('/connections');
      console.log(response.data.connections);
      setConnections(response.data.connections);
      setSentRequests(response.data.sentRequests);
      setReceivedRequests(response.data.receivedRequests);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (userId: string) => {
    setProcessingRequest(userId);
    try {
      await axios.post(`/connections/accept/${userId}`);
      toast.success('Connection request accepted!');
      fetchConnections();
    } catch (error: any) {
      console.error('Error accepting request:', error);
      toast.error(error.response?.data?.message || 'Failed to accept request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const rejectRequest = async (userId: string) => {
    setProcessingRequest(userId);
    try {
      await axios.post(`/connections/reject/${userId}`);
      toast.success('Connection request rejected');
      fetchConnections();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const removeConnection = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this connection?')) return;
    
    setProcessingRequest(userId);
    try {
      await axios.delete(`/connections/${userId}`);
      toast.success('Connection removed');
      fetchConnections();
    } catch (error: any) {
      console.error('Error removing connection:', error);
      toast.error(error.response?.data?.message || 'Failed to remove connection');
    } finally {
      setProcessingRequest(null);
    }
  };

  const filteredConnections = connections.filter(connection =>
    connection.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.user.skills.some(skill => 
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredSentRequests = sentRequests.filter(request =>
    request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.skills.some(skill => 
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredReceivedRequests = receivedRequests.filter(request =>
    request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.skills.some(skill => 
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const tabs = [
    { 
      id: 'connections', 
      label: 'Connections', 
      count: connections.length,
      icon: Users 
    },
    { 
      id: 'received', 
      label: 'Received', 
      count: receivedRequests.length,
      icon: UserPlus 
    },
    { 
      id: 'sent', 
      label: 'Sent', 
      count: sentRequests.length,
      icon: Mail 
    }
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Connections</h1>
          <p className="text-gray-600">
            Manage your professional network and connection requests
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg mb-8"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        activeTab === tab.id
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search connections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Connections Tab */}
          {activeTab === 'connections' && (
            <div>
              {filteredConnections.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {searchTerm ? 'No connections found' : 'No connections yet'}
                  </h2>
                  <p className="text-gray-600 mb-8">
                    {searchTerm 
                      ? 'Try adjusting your search terms'
                      : 'Start connecting with developers to build your network'
                    }
                  </p>
                  {!searchTerm && (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a
                        href="/matches"
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Find Matches
                      </a>
                      <a
                        href="/search"
                        className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Browse Developers
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredConnections.map((connection, index) => (
                    <motion.div
                      key={connection._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`w-16 h-16 ${!connection.user?.profilePicture ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-transparent'} rounded-2xl flex items-center justify-center`}>
                          {
                            connection.user?.profilePicture ? (
                              <img src={connection.user.profilePicture} alt="profile" className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <span className="text-white text-xl font-bold">
                                {connection.user.name.charAt(0).toUpperCase()}
                              </span>
                            )
                          }
                          {/* <span className="text-white text-xl font-bold">
                            {connection.user.name.charAt(0).toUpperCase()}
                          </span> */}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {connection.user.name}
                          </h3>
                          {connection.user.country && (
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <MapPin className="w-3 h-3" />
                              <span>{connection.user.country}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {connection.user.bio && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {connection.user.bio}
                        </p>
                      )}

                      {connection.user.skills.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {connection.user.skills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {connection.user.skills.length > 3 && (
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                +{connection.user.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Connected {new Date(connection.connectedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <a
                          href={`/profile/${connection.user._id}`}
                          className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-center text-sm font-medium"
                        >
                          View Profile
                        </a>
                        <button
                          onClick={() => removeConnection(connection.user._id)}
                          disabled={processingRequest === connection.user._id}
                          className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingRequest === connection.user._id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <UserMinus className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Received Requests Tab */}
          {activeTab === 'received' && (
            <div>
              {filteredReceivedRequests.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {searchTerm ? 'No requests found' : 'No pending requests'}
                  </h2>
                  <p className="text-gray-600">
                    {searchTerm 
                      ? 'Try adjusting your search terms'
                      : 'When developers send you connection requests, they\'ll appear here'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
                  {filteredReceivedRequests.map((request, index) => (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`w-16 h-16 ${!request.profilePicture ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-transparent'} rounded-2xl flex items-center justify-center`}>
                          {request.profilePicture ? (
                            <img src={request.profilePicture} alt="profile" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span className="text-white text-xl font-bold">
                              {request.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {request.name}
                          </h3>
                          {request.country && (
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <MapPin className="w-3 h-3" />
                              <span>{request.country}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {request.bio && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {request.bio}
                        </p>
                      )}

                      {request.skills.length > 0 && (
                        <div className="mb-6">
                          <div className="flex flex-wrap gap-1">
                            {request.skills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {request.skills.length > 3 && (
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                +{request.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <button
                          onClick={() => acceptRequest(request._id)}
                          disabled={processingRequest === request._id}
                          className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingRequest === request._id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Accept</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => rejectRequest(request._id)}
                          disabled={processingRequest === request._id}
                          className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sent Requests Tab */}
          {activeTab === 'sent' && (
            <div>
              {filteredSentRequests.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {searchTerm ? 'No requests found' : 'No sent requests'}
                  </h2>
                  <p className="text-gray-600 mb-8">
                    {searchTerm 
                      ? 'Try adjusting your search terms'
                      : 'Connection requests you send will appear here'
                    }
                  </p>
                  {!searchTerm && (
                    <a
                      href="/search"
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors inline-block"
                    >
                      Find Developers
                    </a>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSentRequests.map((request, index) => (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`w-16 h-16 ${!request.profilePicture ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-transparent'} rounded-2xl flex items-center justify-center`}>
                          {request.profilePicture ? (
                            <img src={request.profilePicture} alt="profile" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span className="text-white text-xl font-bold">
                              {request.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {request.name}
                          </h3>
                          {request.country && (
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <MapPin className="w-3 h-3" />
                              <span>{request.country}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {request.bio && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {request.bio}
                        </p>
                      )}

                      {request.skills.length > 0 && (
                        <div className="mb-6">
                          <div className="flex flex-wrap gap-1">
                            {request.skills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {request.skills.length > 3 && (
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                +{request.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="text-center">
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                          Pending Response
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};