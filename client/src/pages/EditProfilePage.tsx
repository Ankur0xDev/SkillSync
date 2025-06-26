import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, X, Plus, ArrowLeft, Camera } from 'lucide-react';
import { useAuth } from '../Contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useTheme } from '../Contexts/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ProfileData {
  name: string;
  bio: string;
  skills: string[];
  interests: string[];
  github: string;
  linkedin: string;
  website: string;
  country: string;
  city: string;
  availability: string;
  experience: string;
  lookingFor: string[];
  profilePicture: string;
  backgroundPicture: string;
}

export const EditProfilePage: React.FC = () => {
  const {  updateUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    bio: '',
    skills: [],
    interests: [],
    github: '',
    linkedin: '',
    website: '',
    country: '',
    city: '',
    availability: 'flexible',
    experience: 'intermediate',
    lookingFor: [],
    profilePicture: '',
    backgroundPicture: ''
  });

  const availabilityOptions = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'weekends', label: 'Weekends' },
    { value: 'flexible', label: 'Flexible' }
  ];

  const experienceOptions = [
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
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/auth/me');
      const profile = response.data;
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        skills: profile.skills || [],
        interests: profile.interests || [],
        github: profile.github || '',
        linkedin: profile.linkedin || '',
        website: profile.website || '',
        country: profile.country || '',
        city: profile.city || '',
        availability: profile.availability || 'flexible',
        experience: profile.experience || 'intermediate',
        lookingFor: profile.lookingFor || [],
        profilePicture: profile.profilePicture || '',
        backgroundPicture: profile.backgroundPicture || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Format LinkedIn URL if needed
    if (name === 'linkedin') {
      let formattedUrl = value.trim();
      
      // If it's just the username part, add the full URL
      if (formattedUrl && !formattedUrl.startsWith('http')) {
        // Check if it starts with www.
        if (formattedUrl.startsWith('www.')) {
          formattedUrl = `https://${formattedUrl}`;
        } else {
          formattedUrl = `https://www.linkedin.com/in/${formattedUrl.replace(/^\/+|\/+$/g, '')}`;
        }
      }
      
      // Validate LinkedIn URL format
      const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+(\/)?$/;
      if (formattedUrl && !linkedinRegex.test(formattedUrl)) {
        toast.error('Please enter a valid LinkedIn URL (e.g., https://www.linkedin.com/in/username)');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedUrl
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      lookingFor: checked
        ? [...prev.lookingFor, value]
        : prev.lookingFor.filter(item => item !== value)
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);


    try {
      const response = await axios.put('/users/profile', formData);
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'profilePicture' | 'backgroundPicture') => {
    try {
      const formData = new FormData();
      formData.append(type, file);

      const response = await axios.post(`/users/upload/${type === 'profilePicture' ? 'profile-picture' : 'background-picture'}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormData(prev => ({
        ...prev,
        [type]: response.data[type]
      }));

      toast.success(`${type === 'profilePicture' ? 'Profile' : 'Background'} picture updated successfully`);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleImageRemove = async (type: 'profilePicture' | 'backgroundPicture') => {
    try {
      await axios.delete(`/users/${type === 'profilePicture' ? 'profile-picture' : 'background-picture'}`);
      setFormData(prev => ({
        ...prev,
        [type]: ''
      }));
      toast.success(`${type === 'profilePicture' ? 'Profile' : 'Background'} picture removed successfully`);
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/profile')}
            className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'} hover:text-gray-900 mb-4`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Profile</span>
          </button>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Edit Profile</h1>
          <p className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'} mt-2`}>Update your information to help others find you</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Pictures Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-8`}
          >
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-6`}>Profile Pictures</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Picture */}
              <div className="space-y-4">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>Profile Picture</label>
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {formData.profilePicture ? (
                      <img
                        src={formData.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <label className={`cursor-pointer ${theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'} px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors`}>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'profilePicture')}
                      />
                      Upload
                    </label>
                    {formData.profilePicture && (
                      <button
                        type="button"
                        onClick={() => handleImageRemove('profilePicture')}
                        className={`${theme === 'dark' ? 'bg-red-600 text-white' : 'bg-red-600 text-white'} px-4 py-2 rounded-lg hover:bg-red-700 transition-colors`}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Background Picture */}
              <div className="space-y-4">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>Background Picture</label>
                <div className="relative">
                  <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    {formData.backgroundPicture ? (
                      <img
                        src={formData.backgroundPicture}
                        alt="Background"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <label className={`cursor-pointer ${theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'} px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors`}>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'backgroundPicture')}
                      />
                      Upload
                    </label>
                    {formData.backgroundPicture && (
                      <button
                        type="button"
                        onClick={() => handleImageRemove('backgroundPicture')}
                        className={`${theme === 'dark' ? 'bg-red-600 text-white' : 'bg-red-600 text-white'} px-4 py-2 rounded-lg hover:bg-red-700 transition-colors`}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-8`}
          >
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-6`}>Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-700'}`}
                />
              </div>
              <div>
                <label htmlFor="country" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white'}`}
                />
              </div>
              <div>
                <label htmlFor="city" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white'}`}
                />
              </div>
            </div>
            <div className="mt-6">
              <label htmlFor="bio" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell others about yourself, your interests, and what you're looking for..."
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white'}`}
              />
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-8`}
          >
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-6`}>Skills</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className={`${theme === 'dark' ? 'bg-purple-100 text-purple-800' : 'bg-purple-100 text-purple-800'} px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2`}
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className={`${theme === 'dark' ? 'text-purple-600 hover:text-purple-800' : 'text-purple-600 hover:text-purple-800'}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add a skill (e.g., React, Python, Node.js)"
                className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white'}`}
              />
              <button
                type="button"
                onClick={addSkill}
                className={`${theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'} px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-1`}
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </motion.div>

          {/* Interests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-8`}
          >
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-6`}>Interests</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.interests.map((interest, index) => (
                <span
                  key={index}
                  className={`${theme === 'dark' ? 'bg-blue-100 text-blue-800' : 'bg-blue-100 text-blue-800'} px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2`}
                >
                  <span>{interest}</span>
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className={`${theme === 'dark' ? 'text-blue-600 hover:text-blue-800' : 'text-blue-600 hover:text-blue-800'}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                placeholder="Add an interest (e.g., Web Development, AI, Mobile Apps)"
                className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white'}`}
              />
              <button
                type="button"
                onClick={addInterest}
                className={`${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'} px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-1`}
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </motion.div>

          {/* Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-8`}
          >
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-6`}>Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="experience" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                  Experience Level
                </label>
                <select
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white'}`}
                >
                  {experienceOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="availability" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                  Availability
                </label>
                <select
                  id="availability"
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white'}`}
                >
                  {availabilityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-4`}>
                What are you looking for?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lookingForOptions.map(option => (
                  <label key={option.value} className={`flex items-center space-x-3 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>
                    <input
                      type="checkbox"
                      checked={formData.lookingFor.includes(option.value)}
                      onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
                      className={`w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}
                    />
                    <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
              className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-8`}
          >
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-6`}>Links</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="github" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                  GitHub Profile
                </label>
                <input
                  type="url"
                  id="github"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  placeholder="https://github.com/yourusername"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white'}`}
                />
              </div>
              <div>
                <label htmlFor="linkedin" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/yourusername"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white'}`}
                />
              </div>
              <div>
                <label htmlFor="website" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-2`}>
                  Personal Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://yourwebsite.com"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${theme === 'dark' ? 'bg-gray-700 text-gray-100 ' : 'bg-white text-gray-700'}`}
                />
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-end space-x-4"
          >
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className={`px-6 py-3 border border-gray-300  rounded-lg  transition-colors ${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white '}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
                  className={`${theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'} px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {saving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};