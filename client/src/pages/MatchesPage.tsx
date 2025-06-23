import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../Contexts/ThemeContext';
import {
  Heart,
  X,
  MapPin,
  Clock,
  Star,
  RefreshCw,
  Users,
  Sparkles
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface Match {
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
  matchScore: number;
  lastSeen: string;
  backgroundPicture?: string;
  profilePicture?: string;
  isOnline?: boolean;
}

export const MatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<string | null>(null)
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const { theme } = useTheme();
  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await axios.get('/users/matches/suggestions');
      if (Array.isArray(response.data)) {
        setMatches(response.data);
      } else if (response.data?.message) {
        // toast.success(response.data.message)
        setMessage(response.data.message)
        setMatches([]);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  const sendConnectionRequest = async (userId: string) => {
    setSendingRequest(userId);
    try {
      await axios.post(`/connections/send/${userId}`);
      toast.success('Connection request sent!');
      // Remove the user from matches
      setMatches(prev => prev.filter(match => match._id !== userId));
    } catch (error: any) {
      console.error('Error sending connection request:', error);
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setSendingRequest(null);
    }
  };

  const skipMatch = (userId: string) => {
    setMatches(prev => prev.filter(match => match._id !== userId));
    toast.success('Match skipped');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen py-8`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-[15vh]"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-4xl font-bold`}>Perfect Matches</h1>
          </div>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xl mb-6`}>
            Discover developers who complement your skills and share your interests
          </p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-purple-600 text-white'} px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 mx-auto`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Matches'}</span>
          </button>
        </motion.div>
        {
          message && (
            <div className='flex flex-col items-center gap-5 '>
              <p className={`${theme === 'dark' ? 'text-gray-100' : 'text-red-600'} text-2xl font-bold animate-pulse flex items-center gap-2`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856C19.07 19 20 17.95 20 16.714V7.286C20 6.05 19.07 5 17.918 5H6.082C4.93 5 4 6.05 4 7.286v9.428C4 17.95 4.93 19 6.082 19z" />
                </svg>
                You have an incomplete profile
              </p>
              <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-purple-600'} text-center bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient`}>
                {message}
              </span>

              <Link to='/profile/edit' className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-purple-600 text-white'} cursor-pointer rounded-md p-4 bg-gradient-to-r from-purple-600 to-blue-600 w-max hover::bg-purple-700 `}>Edit Profile?</Link>
            </div>
          )
        }

        {matches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-2xl font-bold mb-4`}>No matches found</h2>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-8 max-w-md mx-auto`}>
              We couldn't find any matches right now. Try updating your profile with more skills and interests,
              or check back later for new members!
            </p>
            <button
              onClick={handleRefresh}
              className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-purple-600 text-white'} px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors`}
            >
              Try Again
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {matches.map((match, index) => (
              <motion.div
                key={match._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}
              >
                <div
                  className={`p-6 ${theme === 'dark' ? 'text-gray-100' : 'text-white'} relative`}
                  style={{
                    backgroundImage: match.backgroundPicture
                      ? `linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${match.backgroundPicture})`
                      : 'linear-gradient(to right, #9333ea, #2563eb)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-white/20'}`}>
                        {match.profilePicture ? (
                          <img
                            src={match.profilePicture}
                            alt={match.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full ${theme === 'dark' ? 'bg-gradient-to-r from-gray-700 to-gray-800' : 'bg-gradient-to-r from-purple-600 to-blue-600'} flex items-center justify-center`}>
                            <span className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-white'}`}>
                              {match.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      {match.isOnline && (
                        <div className={`absolute bottom-0 right-0 w-4 h-4 ${theme === 'dark' ? 'bg-green-500' : 'bg-green-500'} rounded-full border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-white'}`}></div>
                      )}
                    </div>
                    <div className={`flex items-center space-x-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white/20'} px-3 py-1 rounded-full`}>
                      <Star className="w-4 h-4 text-yellow-300" />
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{match.matchScore}% match</span>
                    </div>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-white'}`}>{match.name}</h3>
                  <div className={`flex items-center space-x-4 text-sm opacity-90 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {match.country && (
                      <div className={`flex items-center space-x-1 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-200'}`}>
                        <MapPin className="w-3 h-3" />
                        <span>{match.city ? `${match.city}, ` : ''}{match.country}</span>
                      </div>
                    )}
                    <div className={`flex items-center space-x-1 ${theme === 'dark' ? 'text-gray-100' : 'text-white'}`}>
                      <Clock className="w-3 h-3" />
                      <span>Active recently</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Bio */}
                  {match.bio && (
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'} text-sm mb-4 line-clamp-3`}>
                      {match.bio}
                    </p>
                  )}

                  {/* Tags */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExperienceColor(match.experience)}`}>
                        {match.experience.charAt(0).toUpperCase() + match.experience.slice(1)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(match.availability)}`}>
                        {match.availability.charAt(0).toUpperCase() + match.availability.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  {match.skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-sm font-medium mb-2`}>Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {match.skills.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-purple-100 text-purple-800'} px-2 py-1 rounded text-xs font-medium`}
                          >
                            {skill}
                          </span>
                        ))}
                        {match.skills.length > 4 && (
                          <span className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-600'} px-2 py-1 rounded text-xs`}>
                            +{match.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Interests */}
                  {match.interests.length > 0 && (
                    <div className="mb-6">
                      <h4 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-sm font-medium mb-2`}>Interests</h4>
                      <div className="flex flex-wrap gap-1">
                        {match.interests.slice(0, 3).map((interest, idx) => (
                          <span
                            key={idx}
                            className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-blue-100 text-blue-800'} px-2 py-1 rounded text-xs font-medium`}
                          >
                            {interest}
                          </span>
                        ))}
                        {match.interests.length > 3 && (
                          <span className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-600'} px-2 py-1 rounded text-xs`}>
                            +{match.interests.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Looking For */}
                  {match.lookingFor.length > 0 && (
                    <div className="mb-6">
                      <h4 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-sm font-medium mb-2`}>Looking For</h4>
                      <div className="space-y-1">
                        {match.lookingFor.slice(0, 2).map((item, idx) => (
                          <div key={idx} className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            • {item.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => skipMatch(match._id)}
                      className={`flex-1 ${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-700'} py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2`}
                    >
                      <X className="w-4 h-4" />
                      <span>Skip</span>
                    </button>
                    <button
                      onClick={() => sendConnectionRequest(match._id)}
                      disabled={sendingRequest === match._id}
                        className={`flex-1 ${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-purple-600 text-white'} py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {sendingRequest === match._id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Heart className="w-4 h-4" />
                          <span>Connect</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};