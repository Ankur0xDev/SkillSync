import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import { useTheme } from '../Contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const CreateProfilePage = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
    const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    skills: [] as string[],
    interests: [] as string[],
    education: '',
    experience: '',
    profilePicture: null as File | null,
    backgroundPicture: null as File | null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const handleSkillsChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const input = e.currentTarget;
      const value = input.value.trim();
      
      if (value && !formData.skills.includes(value)) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, value]
        }));
        input.value = '';
      }
    }
  };

  const handleInterestsChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const input = e.currentTarget;
      const value = input.value.trim();
      
      if (value && !formData.interests.includes(value)) {
        setFormData(prev => ({
          ...prev,
          interests: [...prev.interests, value]
        }));
        input.value = '';
      }
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          if (Array.isArray(value)) {
            formDataToSend.append(key, JSON.stringify(value));
          } else {
            formDataToSend.append(key, value);
          }
        }
      });

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/profile`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      await updateUser(response.data);
      toast.success('Profile created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-3xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow rounded-lg p-6`}>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-6`}>Create Your Profile</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={`mt-1 block w-full rounded-md ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
                className={`mt-1 block w-full rounded-md ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
              />
            </div>

            {/* Skills */}
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>Skills</label>
              <input
                type="text"
                onKeyDown={handleSkillsChange}
                placeholder="Type a skill and press Enter"
                className={`mt-1 block w-full rounded-md ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.skills.map(skill => (
                  <span
                    key={skill}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-indigo-100 text-indigo-800' : 'bg-indigo-100 text-indigo-800'}`}
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className={`ml-2 ${theme === 'dark' ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-600 hover:text-indigo-800'}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>Interests</label>
              <input
                type="text"
                onKeyDown={handleInterestsChange}
                placeholder="Type an interest and press Enter"
                className={`mt-1 block w-full rounded-md ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.interests.map(interest => (
                  <span
                    key={interest}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-green-100 text-green-800' : 'bg-green-100 text-green-800'}`}
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className={`ml-2 ${theme === 'dark' ? 'text-green-600 hover:text-green-800' : 'text-green-600 hover:text-green-800'}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>Education</label>
              <textarea
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                rows={3}
                className={`mt-1 block w-full rounded-md ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
              />
            </div>

            {/* Experience */}
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>Experience</label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                rows={3}
                className={`mt-1 block w-full rounded-md ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
              />
            </div>

            {/* Profile Picture */}
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>Profile Picture</label>
              <input
                type="file"
                name="profilePicture"
                onChange={handleFileChange}
                accept="image/*"
                className={`mt-1 block w-full ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
              />
            </div>

            {/* Background Picture */}
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>Background Picture</label>
              <input
                type="file"
                name="backgroundPicture"
                onChange={handleFileChange}
                accept="image/*"
                className={`mt-1 block w-full ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md ${theme === 'dark' ? 'text-white bg-indigo-600 hover:bg-indigo-700' : 'text-white bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50`}
              >
                {loading ? 'Creating Profile...' : 'Create Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProfilePage; 