import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../Contexts/ThemeContext';
import { Lock, User, Shield } from 'lucide-react';

interface PrivateProfileProps {
  userName?: string;
}

export const PrivateProfile: React.FC<PrivateProfileProps> = ({ userName }) => {
  const { theme } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`min-h-screen ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} flex items-center justify-center py-12`}
    >
      <div className="max-w-md w-full mx-auto px-4">
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-8 text-center`}>
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-red-600" />
          </div>

          {/* Title */}
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
            Profile is Private
          </h1>

          {/* Message */}
          <p className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'} mb-6`}>
            {userName ? (
              <>
                <span className="font-medium">{userName}</span>'s profile is set to private.
              </>
            ) : (
              "This profile is set to private."
            )}
            <br />
            Only the profile owner can view this content.
          </p>

          {/* Features */}
          <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 mb-6`}>
            <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-3 flex items-center justify-center`}>
              <Shield className="w-4 h-4 mr-2" />
              What's Hidden
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                Profile information
              </li>
              <li className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                Skills and interests
              </li>
              <li className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                Project details
              </li>
              <li className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                Connection status
              </li>
            </ul>
          </div>

          {/* Action */}
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className={`w-full px-4 py-2 ${theme === 'dark' ? 'bg-purple-600' : 'bg-purple-600'} text-white rounded-lg hover:bg-purple-700 transition-colors`}
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.href = '/search'}
                className={`w-full px-4 py-2 ${theme === 'dark' ? 'bg-gray-100' : 'bg-gray-100'} text-gray-700 rounded-lg hover:bg-gray-200 transition-colors`}
            >
              Browse Other Developers
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivateProfile; 