import React, { useState, useEffect } from 'react';
import { useTheme } from '../Contexts/ThemeContext';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Edit3,
  Github,
  Linkedin,
  Globe,
  Eye,
  Users,

  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../Contexts/AuthContext';
// import { LoadingSpinner } from '../components/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';
import { SocialStats } from '../components/SocialStats';
import type { User } from '../types';
import { VerifiedBadge } from '../components/VerifiedBadge ';
import { PrivateProfile } from '../components/PrivateProfile';
import { ConnectionsOnlyProfile } from '../components/ConnectionsOnlyProfile';

export const ProfilePage: React.FC = () => {
  const { theme } = useTheme();
    const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPrivateProfile, setIsPrivateProfile] = useState(false);
  const [isConnectionsOnlyProfile, setIsConnectionsOnlyProfile] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // If no userId in params and no authenticated user, redirect to login
        if (!userId && !user) {
          navigate('/auth');
          console.log('No user Id is provided')
          toast.error('Please login to view this profile');
          return;
        }

        const targetId = userId || user?._id;

        if (!targetId) {
          setError('No user ID provided');
          setLoading(false);
          return;
        }

        console.log('Fetching profile for userId:', targetId);
        const response = await axios.get(`/users/${targetId}`);
        console.log('Profile data received:', response.data);
        setProfile(response.data);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        if (err.response?.status === 401) {
          // If unauthorized, redirect to login
          navigate('/auth');
        } else if (err.response?.status === 403 && err.response?.data?.message?.includes('private')) {
          // If profile is private, show private profile component
          setIsPrivateProfile(true);
        } else if (err.response?.status === 403 && err.response?.data?.message?.includes('connections')) {
          // If profile is connections-only, show connections-only profile component
          setIsConnectionsOnlyProfile(true);
        } else {
          setError(err.response?.data?.message || 'Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, user, navigate]);

  console.log('Current state:', { loading, error, profile });

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(true);
    try {
      await axios.delete('/users/account');
      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (isPrivateProfile) {
    return <PrivateProfile />;
  }

  if (isConnectionsOnlyProfile) {
    return <ConnectionsOnlyProfile />;
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500 dark:text-red-400">
          {error || 'Profile not found'}
          <button
            onClick={() => window.location.reload()}
            className="ml-4 text-primary-600 hover:text-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden mb-8`}
        >
          <div
            className={`h-36 ${theme === 'dark' ? 'bg-gradient-to-r from-green-600 to-blue-600' : 'bg-gradient-to-r from-purple-600 to-blue-600'} relative`}
            style={{
              backgroundImage: profile.backgroundPicture ? `url(${profile.backgroundPicture})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {!profile.backgroundPicture && (
              <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-r from-green-600 to-blue-600' : 'bg-gradient-to-r from-purple-600 to-blue-600'} opacity-90`} />
            )}
          </div>
          <div className="relative px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-6 mt-8">
              <div className={`w-32 h-32 ${profile.profilePicture ? 'bg-white' : `${theme === 'dark' ? 'bg-gradient-to-r from-green-600 to-blue-600' : 'bg-gradient-to-r from-purple-600 to-blue-600'}`} rounded-2xl shadow-lg flex items-center justify-center border-4 border-white overflow-hidden`}>
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.name || profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {(profile.name || profile.username).charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 ">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className='flex  items-center justify-center gap-2'>
                      <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} cursor-default `}>
                        {profile.name || profile.username}
                      </h1>
                      <h1 className='mt-1 '>
                        {profile.isVerified ?
                          (<VerifiedBadge />)
                          :
                          (<p className='text-gray-400 italic cursor-default'>(not verified)</p>)}
                      </h1>
                    </div>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      {profile.bio || 'No bio available'}
                    </p>
                    {(profile.city || profile.country) && (
                      <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                        📍 {[profile.city, profile.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                  {/* <Link
                    to="/profile/edit"
                    className={`mt-4 sm:mt-0 ${theme === 'dark' ? 'bg-green-600 text-white' : 'bg-purple-600 text-white'} px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2`}
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Link> */}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social Stats */}
        {(profile.githubUrl || profile.linkedin) && (
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
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-4`}>About</h2>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{profile.bio || 'No bio available'}</p>
            </motion.div>

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className={`px-3 ${theme === 'dark' ? 'bg-green-300 text-green-800' : 'bg-purple-300 text-purple-800'} py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100 rounded-full text-sm`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
                  Interests
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className={`px-3 py-1 ${theme === 'dark' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'} rounded-full text-sm`}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}
            >
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Profile Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Profile Views</span>
                  </div>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{profile?.profileViews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Connections</span>
                  </div>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{profile?.connections?.length}</span>
                </div>
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
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
                transition={{ delay: 0.3 }}
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-8`}
              >
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Links</h2>
                <div className="space-y-4">
                  {profile.github && (
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-gray-400 hover:text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
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
                      className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-gray-400 hover:text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
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
                        className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-gray-400 hover:text-green-600' : 'text-gray-600 hover:text-green-900'}`}
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
                transition={{ delay: 0.3 }}
                    className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-8`}
              >
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Links</h2>
                <div className={`space-y-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} italic`}>
                  Not provided
                </div>

              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};