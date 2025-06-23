import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import axios from 'axios';
import { Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../Contexts/ThemeContext';

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

export const EditProfile: React.FC = () => {
  const {  updateUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/users/profile');
      setProfileData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const handleImageUpload = async (file: File, type: 'profilePicture' | 'backgroundPicture') => {
    try {
      const formData = new FormData();
      formData.append(type, file);

      console.log('Uploading file:', file);

      const response = await axios.post(`/users/upload/${type === 'profilePicture' ? 'profile-picture' : 'background-picture'}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Upload response:', response.data);

      setProfileData(prev => ({
        ...prev,
        [type]: response.data[type]
      }));

      toast.success(`${type === 'profilePicture' ? 'Profile' : 'Background'} picture updated successfully`);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    }
  };

  const handleImageRemove = async (type: 'profilePicture' | 'backgroundPicture') => {
    try {
      await axios.delete(`/users/${type}`);
      setProfileData(prev => ({
        ...prev,
        [type]: ''
      }));
      toast.success(`${type === 'profilePicture' ? 'Profile' : 'Background'} picture removed successfully`);
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put('/users/profile', profileData);
      updateUser(response.data.user);
      toast.success('Profile updated successfully');
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Picture Section */}
          <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-6`}>Profile Pictures</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Picture */}
              <div className="space-y-4">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>Profile Picture</label>
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {profileData.profilePicture ? (
                      <img
                        src={profileData.profilePicture}
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
                    {profileData.profilePicture && (
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
                    {profileData.backgroundPicture ? (
                      <img
                        src={profileData.backgroundPicture}
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
                    {profileData.backgroundPicture && (
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
          </div>

          {/* Basic Information */}
          <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-6`}>Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-6`}>Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>Country</label>
                <input
                  type="text"
                  value={profileData.country}
                  onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>City</label>
                <input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-6`}>Social Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>GitHub</label>
                <input
                  type="url"
                  value={profileData.github}
                  onChange={(e) => setProfileData(prev => ({ ...prev, github: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>LinkedIn</label>
                <input
                  type="url"
                  value={profileData.linkedin}
                  onChange={(e) => setProfileData(prev => ({ ...prev, linkedin: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>Website</label>
                <input
                  type="url"
                  value={profileData.website}
                  onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
                className={`${theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'} px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50`}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 