import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../Contexts/ThemeContext';
import { 
  Globe, 
  X,
  Github
} from 'lucide-react';

interface NoPreviewAvailableProps {
  projectTitle: string;
  githubUrl: string;
  onClose?: () => void;
}

export const NoPreviewAvailable: React.FC<NoPreviewAvailableProps> = ({ 
  projectTitle, 
  githubUrl, 
  onClose 
}) => {
  const { theme } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl overflow-hidden`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <div className="flex items-center space-x-3">
          <Globe className="w-5 h-5 text-gray-400" />
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Preview</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-500'} truncate max-w-xs`}>
              {projectTitle}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`p-2 ${theme === 'dark' ? 'text-gray-100 hover:text-gray-700' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-8 text-center">
        <div className={`w-24 h-24 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
          <Globe className="w-12 h-12 text-gray-400" />
        </div>
        
        <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-3`}>
          No Live Preview Available
        </h3>
        
        <p className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'} mb-6 max-w-md mx-auto`}>
          This project doesn't have a live demo URL configured. You can still view the source code and documentation on GitHub.
        </p>

        <div className="space-y-3">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center space-x-2 ${theme === 'dark' ? 'bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors' : 'bg-gray-100 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors'}`}
          >
            <Github className="w-5 h-5" />
            <span>View on GitHub</span>
          </a>
          
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-500'}`}>
            <p>To add a live preview:</p>
            <p>1. Deploy your project to a hosting service</p>
            <p>2. Edit your project and add the live URL</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 