import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../Contexts/ThemeContext';  
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Github,
  Linkedin,
  Globe,
  UserPlus,
  ArrowLeft,
  Clock,
  Star,
  Users,
  Check
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../Contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { VerifiedBadge } from '../components/VerifiedBadge ';
import { SocialStats } from '../components/SocialStats';

interface PublicProfile {
  _id: string;
  username: string;
  email: string;
  updatedAt: string;
  name: string;
  bio: string;
  skills: string[];
  isVerified: boolean;
  interests: string[];
  github: string;
  linkedin: string;
  website: string;
  country: string;
  city: string;
  availability: string;
  experience: string;
  lookingFor: string[];
  profileViews: number;
  connections: string[];
  createdAt: string;
  lastSeen: string;
  profilePicture?: string;
  backgroundPicture?: string;
}

export const PublicProfilePage: React.FC = () => {
  const { theme } = useTheme();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sentRequest, setSentRequest] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchProfile();
      if (isAuthenticated) {
        fetchConnectionStatus();
      }
    }
  }, [id, isAuthenticated]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`/users/${id}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };
  // console.log(profile)
  const fetchConnectionStatus = async () => {
    try {
      const response = await axios.get('/connections');
      const { connections, sentRequests } = response.data;

      // Check if the profile owner is in connections
      const isConnected = connections.some((conn: any) => conn.user._id === id);
      setIsConnected(isConnected);

      // Check if a request has been sent
      const hasSentRequest = sentRequests.some((req: any) => req._id === id);
      setSentRequest(hasSentRequest);
    } catch (error) {
      console.error('Error fetching connection status:', error);
    }
  };

  const sendConnectionRequest = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to connect with developers');
      return;
    }

    setSendingRequest(true);
    try {
      await axios.post(`/connections/send/${id}`);
      toast.success('Connection request sent!');
    } catch (error: any) {
      console.error('Error sending connection request:', error)
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setSendingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile not found</h2>
          <Link to="/search" className="text-purple-600 hover:text-purple-700">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?._id === profile._id;

  const experienceColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-blue-100 text-blue-800',
    advanced: 'bg-purple-100 text-purple-800',
    expert: 'bg-red-100 text-red-800'
  };

  const availabilityColors = {
    'full-time': 'bg-green-100 text-green-800',
    'part-time': 'bg-yellow-100 text-yellow-800',
    'weekends': 'bg-blue-100 text-blue-800',
    'flexible': 'bg-purple-100 text-purple-800'
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Active now';
    if (diffInHours < 24) return `Active ${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Active ${diffInDays}d ago`;
    return `Active ${Math.floor(diffInDays / 7)}w ago`;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            to="/search"
            className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-100' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Search</span>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden mb-8`}
        >
          <div
            className="h-32 relative"
            style={{
              backgroundImage: profile.backgroundPicture ? `url(${profile.backgroundPicture})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {!profile.backgroundPicture && (
              <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-r from-green-600 to-blue-600' : 'bg-gradient-to-r from-purple-600 to-blue-600'}`} />
            )}
            <div className="absolute inset-0 bg-black/30" />
          </div>

          <div className="relative px-8 pb-8">
            <div className={`flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 -mt-8`}>
              <div className={`w-32 h-32 ${profile.profilePicture ? 'bg-white/20' : theme === 'dark' ? 'bg-gradient-to-r from-green-600 to-blue-600' : 'bg-gradient-to-r from-purple-600 to-blue-600'} rounded-2xl shadow-lg flex items-center justify-center border-4 border-white overflow-hidden`}>
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className='flex  items-center justify-center gap-2 mb-3 '>
                      <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} cursor-default `}>
                        {profile.name}
                      </h1>
                      <h1 className='mt-1 '>
                        {profile.isVerified ?
                          (<VerifiedBadge />)
                          :
                          (<p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} italic cursor-default`}> (not verified)</p>)}
                      </h1>
                    </div>

                    <div className={`flex flex-wrap items-center gap-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                      {profile.country && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{profile.city ? `${profile.city}, ` : ''}{profile.country}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1 ">
                        
                        <Calendar className="w-4 h-4" />
                        <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                        
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{getTimeAgo(profile.lastSeen)}</span>
                      </div>
                    </div>
                  </div>
                  {!isOwnProfile && isAuthenticated && !isConnected && (
                    <button
                      onClick={sendConnectionRequest}
                      disabled={sendingRequest || sentRequest}
                      className={`${theme === 'dark' ? 'bg-green-600 text-white' : 'bg-purple-600 text-white'} px-6 py-2 mt-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {sendingRequest ? (
                        <LoadingSpinner size="sm" />
                      ) : sentRequest ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Request Sent</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Connect</span>
                        </>
                      )}
                    </button>
                  )}
                  {!isOwnProfile && isAuthenticated && isConnected && (
                    <div className={`${theme === 'dark' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'} px-6 py-2 mt-4  rounded-lg flex items-center space-x-2`}>
                      <Check className="w-4 h-4" />
                      <span>Connected</span>
                    </div>
                  )}
                  {isOwnProfile && (
                    <Link
                      to="/profile/edit"
                      className={`${theme === 'dark' ? 'bg-green-600 text-white' : 'bg-purple-600 text-white'} px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors`}
                    >
                      Edit Profile
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social Stats Section */}
        {(profile.github || profile.linkedin) && (
          <SocialStats user={profile} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-8`}
            >
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-6`}>About</h2>
              {profile.bio ? (
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'} leading-relaxed`}>{profile.bio}</p>
              ) : (
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} italic`}>No bio available</p>
              )}
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-8`}
            >
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-6`}>Skills</h2>
              {profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className={`${theme === 'dark' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'} px-4 py-2 rounded-full text-sm font-medium`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} italic`}>No skills listed</p>
              )}
            </motion.div>

            {/* Interests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-8`}
            >
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-6`}>Interests</h2>
              {profile.interests.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className={`${theme === 'dark' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'} px-4 py-2 rounded-full text-sm font-medium`}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} italic`}>No interests listed</p>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}
            >
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Profile Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Profile Views</span>
                  </div>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{profile.profileViews}</span>


                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Connections</span>
                  </div>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{profile.connections.length}</span>


                </div>
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}
            >
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Details</h3>
              <div className="space-y-4">
                {profile.experience && (
                  <div>
                    <label className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} block mb-1`}>Experience Level</label>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${experienceColors[profile.experience as keyof typeof experienceColors]}`}>
                      {profile.experience.charAt(0).toUpperCase() + profile.experience.slice(1)}
                    </span>
                  </div>
                )}
                {profile.availability && (
                  <div>
                    <label className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} block mb-1`}>Availability</label>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${availabilityColors[profile.availability as keyof typeof availabilityColors]}`}>
                      {profile.availability.charAt(0).toUpperCase() + profile.availability.slice(1)}
                    </span>
                  </div>
                )}
                {profile.lookingFor && profile.lookingFor.length > 0 && (
                  <div>
                    <label className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} block mb-2`}>Looking For</label>
                    <div className="space-y-1">
                      {profile.lookingFor.map((item, index) => (
                        <div key={index} className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                          • {item.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Links */}
            {(profile.github || profile.linkedin || profile.website) ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}
              >
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Links</h3>
                <div className="space-y-3">
                  {profile.github && (
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center space-x-3 ${theme === 'dark' ? 'text-green-600 hover:text-gray-900' : 'text-blue-600 hover:text-gray-900'} transition-colors`}
                    >
                      <Github className="w-5 h-5" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {profile.linkedin && (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center space-x-3 ${theme === 'dark' ? 'text-green-600 hover:text-gray-900' : 'text-blue-600 hover:text-gray-900'} transition-colors`}
                    >
                      <Linkedin className="w-5 h-5" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                        className={`flex items-center space-x-3 ${theme === 'dark' ? 'text-green-600 hover:text-gray-900' : 'text-blue-600 hover:text-gray-900'} transition-colors`}
                    >
                      <Globe className="w-5 h-5" />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}
              >
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Links</h3>
                <div>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} italic`}>Not Provided</p>
                </div>

              </motion.div>

            )}

            {/* Connect CTA */}
            {!isOwnProfile && !isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className={`${theme === 'dark' ? 'bg-gradient-to-r from-green-600 to-blue-600' : 'bg-gradient-to-r from-purple-600 to-blue-600'} rounded-2xl shadow-lg p-6 text-white text-center`}
              >
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Want to connect?</h3>
                <p className={`${theme === 'dark' ? 'text-green-100' : 'text-purple-100'} text-sm mb-4`}>
                  Sign up to send connection requests and build your network
                </p>
                <Link
                  to="/auth"
                      className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-purple-600'} px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors inline-block`}
                >
                  Sign Up Free
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};