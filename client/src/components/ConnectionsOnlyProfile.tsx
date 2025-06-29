import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Shield } from 'lucide-react';
import { useTheme } from '../Contexts/ThemeContext';
import { Link } from 'react-router-dom';

interface ConnectionsOnlyProfileProps {
  userName?: string;
}

export const ConnectionsOnlyProfile: React.FC<ConnectionsOnlyProfileProps> = ({ userName }) => {
  const { theme } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`min-h-screen ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} flex items-center justify-center py-12`}
    >
      <div className="max-w-md w-full mx-auto px-4">
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-8 text-center`}>
          {/* Icon */}
          <div className={`mx-auto w-20 h-20 ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-100'} rounded-full flex items-center justify-center mb-6`}>
            <Users className={`w-10 h-10 ${theme === 'dark' ? 'text-gray-100' : 'text-blue-600'}`} />
          </div>

          {/* Title */}
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
            Connections Only
          </h1>

          {/* Message */}
          <p className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'} mb-6`}>
            {userName ? (
              <>
                <span className="font-medium">{userName}</span>'s profile is only visible to their connections.
              </>
            ) : (
              "This profile is only visible to connections."
            )}
            <br />
            Connect with them to view their full profile.
          </p>

          {/* Features */}
          <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 mb-6`}>
            <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-3 flex items-center justify-center`}>
              <Shield className="w-4 h-4 mr-2" />
              What You'll See After Connecting
            </h3>
            <ul className={`text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'} space-y-2`}>
              <li className="flex items-center">
                <UserPlus className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-400'}`} />
                Full profile information
              </li>
              <li className="flex items-center">
                <UserPlus className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-400'}`} />
                Skills and interests
              </li>
              <li className="flex items-center">
                <UserPlus className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-400'}`} />
                Project details
              </li>
              <li className="flex items-center">
                <UserPlus className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-400'}`} />
                Direct messaging
              </li>
            </ul>
          </div>

          {/* Action */}
          <div className="space-y-3">
            <Link
              to="/search"
              className={`block w-full px-4 py-2 ${theme === 'dark' ? 'bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors' : 'bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'}`}
            >
              Find More Developers
            </Link>
            <button
              onClick={() => window.history.back()}
              className={`w-full px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors' : 'bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'}`}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ConnectionsOnlyProfile; 