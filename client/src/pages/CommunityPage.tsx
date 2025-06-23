import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../Contexts/ThemeContext';
import { 
  Users, 
  TrendingUp, 
  Star,
  MessageSquare,
  Heart,
  Share2,
  Search,
  Send,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
// import { useAuth } from '../Contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
// import { useSocket } from '../hooks/useSocket';

interface CommunityPost {
  _id: string;
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  content: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  tags: string[];
}

interface TrendingTopic {
  tag: string;
  count: number;
  posts: number;
}

interface ActiveUser {
  _id: string;
  name: string;
  profilePicture?: string;
  skills: string[];
  lastSeen: string;
  postCount: number;
}

// interface ChatMessage {
//   id: string;
//   user: {
//     _id: string;
//     name: string;
//     profilePicture?: string;
//   };
//   content: string;
//   timestamp: string;
// }

// interface User {
//   _id: string;
//   name: string;
//   profilePicture?: string;
// }

export const CommunityPage: React.FC = () => {
  const { theme } = useTheme();
  // const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCommunityData();
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Placeholder for the removed sendMessage function
  };

  const fetchCommunityData = async () => {
    try {
      const [postsRes, topicsRes, usersRes] = await Promise.all([
        axios.get('/api/community/posts'),
        axios.get('/api/community/trending'),
        axios.get('/api/community/active-users')
      ]);

      setPosts(postsRes.data);
      setTrendingTopics(topicsRes.data);
      setActiveUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching community data:', error);
      toast.error('Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = !selectedTopic || post.tags.includes(selectedTopic);
    return matchesSearch && matchesTopic;
  });

  // const isCurrentUser = (messageUserId: string) => {
  //   return user && '_id' in user && user._id === messageUserId;
  // };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Users className="w-8 h-8 text-purple-600" />
            <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Community</h1>
          </div>
          <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
            Connect with developers, share ideas, and stay updated with the latest trends
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className={`${theme === 'dark' ? 'text-gray-400' : 'text-white'} absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5`} />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border ${theme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Posts */}
          <div className={`${showChat ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
            {/* Trending Topics */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Trending Topics</h2>
                </div>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-green-600 hover:text-green-700' : 'text-purple-600 hover:text-purple-700'}`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>{showChat ? 'Hide Chat' : 'Show Chat'}</span>
                  {showChat ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingTopics.map((topic) => (
                  <button
                    key={topic.tag}
                    onClick={() => setSelectedTopic(selectedTopic === topic.tag ? null : topic.tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTopic === topic.tag
                        ? `${theme === 'dark' ? 'bg-green-600 text-white' : 'bg-purple-600 text-white'}`
                        : `${theme === 'dark' ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-purple-100 text-purple-800 hover:bg-purple-200'}`
                    }`}
                  >
                    #{topic.tag} ({topic.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-6">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}
                >
                  <div className="flex items-start space-x-4">
                    <Link to={`/profile/${post.user._id}`} className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                        {post.user.profilePicture ? (
                          <img
                            src={post.user.profilePicture}
                            alt={post.user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl font-bold text-white">
                            {post.user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <Link
                          to={`/profile/${post.user._id}`}
                          className={`font-medium ${theme === 'dark' ? 'text-gray-100 hover:text-green-600' : 'text-gray-900 hover:text-purple-600'}`}
                        >
                          {post.user.name}
                        </Link>
                        <span className="text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-4`}>{post.content}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`px-2 py-1 ${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-purple-100 text-purple-800'} rounded text-xs font-medium`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className={`flex items-center space-x-6 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-500'}`}>
                        <button className={`flex items-center space-x-1 ${theme === 'dark' ? 'hover:text-green-600' : 'hover:text-purple-600'}`}>
                          <Heart className="w-4 h-4" />
                          <span>{post.likes}</span>
                        </button>
                        <button className={`flex items-center space-x-1 ${theme === 'dark' ? 'hover:text-green-600' : 'hover:text-purple-600'}`}>
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.comments}</span>
                        </button>
                        <button className={`flex items-center space-x-1 ${theme === 'dark' ? 'hover:text-green-600' : 'hover:text-purple-600'}`}>
                          <Share2 className="w-4 h-4" />
                          <span>{post.shares}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chat Panel */}
          {showChat && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`lg:col-span-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)]`}
            >
              {/* Chat Header */}
              <div className={`p-4 ${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Community Chat</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-500'}`}>Global Room</p>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Placeholder for the removed messages */}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className={`p-4 ${theme === 'dark' ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className={`flex-1 px-4 py-2 border ${theme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className={`${theme === 'dark' ? 'bg-green-600 text-white' : 'bg-purple-600 text-white'} p-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Sidebar */}
          {!showChat && (
            <div className="space-y-6">
              {/* Active Users */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
                <div className="flex items-center space-x-2 mb-4">
                  <Star className="w-5 h-5 text-purple-600" />
                  <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Active Users</h2>
                </div>
                <div className="space-y-4">
                  {activeUsers.map((user) => (
                    <Link
                      key={user._id}
                      to={`/profile/${user._id}`}
                      className={`flex items-center space-x-3 p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} truncate`}>
                          {user.name}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-100' : 'text-gray-500'}`}>
                          {user.postCount} posts • Active recently
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Community Stats */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Community Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-purple-50'} rounded-lg p-4`}>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>Total Posts</p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-600' : 'text-purple-600'}`}>{posts.length}</p>
                  </div>
                  <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'} rounded-lg p-4`}>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>Active Users</p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-600' : 'text-blue-600'}`}>{activeUsers.length}</p>
                  </div>
                  <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'} rounded-lg p-4`}>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>Trending Topics</p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-600' : 'text-green-600'}`}>{trendingTopics.length}</p>
                  </div>
                    <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-yellow-50'} rounded-lg p-4`}>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>Total Interactions</p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {posts.reduce((sum, post) => sum + post.likes + post.comments + post.shares, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 