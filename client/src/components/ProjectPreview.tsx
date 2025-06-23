import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ExternalLink, 
  RefreshCw, 
  AlertCircle,
  Globe,
  X
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { useTheme } from '../Contexts/ThemeContext';

interface ProjectPreviewProps {
  projectUrl: string;
  projectTitle: string;
  onClose?: () => void;
}

export const ProjectPreview: React.FC<ProjectPreviewProps> = ({ 
  projectUrl, 
  projectTitle, 
  onClose 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const { theme } = useTheme();
  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    setIframeKey(prev => prev + 1);
  };

  const handleOpenInNewTab = () => {
    window.open(projectUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-2xl shadow-xl overflow-hidden`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <div className="flex items-center space-x-3">
          <Globe className="w-5 h-5 text-purple-600" />
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Live Preview</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-500'} truncate max-w-xs`}>
              {projectTitle}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={`p-2 ${theme === 'dark' ? 'text-gray-100 hover:text-gray-700' : 'text-gray-500 hover:text-gray-700'} transition-colors disabled:opacity-50`}
            title="Refresh Preview"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenInNewTab}
            className={`p-2 ${theme === 'dark' ? 'text-gray-100 hover:text-blue-600' : 'text-gray-500 hover:text-blue-600'} transition-colors`}
            title="Open in New Tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className={`p-2 ${theme === 'dark' ? 'text-gray-100 hover:text-gray-700' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className={`relative ${theme === 'dark' ? 'bg-gray-100' : 'bg-gray-100'}`} style={{ height: '600px' }}>
        {isLoading && (
          <div className={`absolute inset-0 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} z-10`}>
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className={`mt-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>Loading preview...</p>
            </div>
          </div>
        )}

        {hasError && (
          <div className={`absolute inset-0 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} z-10`}>
            <div className="text-center p-6">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                Preview Unavailable
              </h3>
              <p className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'} mb-4 max-w-sm`}>
                Unable to load the preview. This could be due to CORS restrictions or the site not being accessible.
              </p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={handleRefresh}
                  className={`px-4 py-2 ${theme === 'dark' ? 'bg-purple-600' : 'bg-purple-600'} text-white rounded-lg hover:bg-purple-700 transition-colors`}
                >
                  Try Again
                </button>
                <button
                  onClick={handleOpenInNewTab}
                  className={`px-4 py-2 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} text-gray-700 rounded-lg hover:bg-gray-50 transition-colors`}
                >
                  Open in New Tab
                </button>
              </div>
            </div>
          </div>
        )}

        <iframe
          key={iframeKey}
          src={projectUrl}
          className={`w-full h-full border-0`}
          title={`Preview of ${projectTitle}`}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          loading="lazy"
        />
      </div>

      {/* Footer */}
          <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <div className={`flex items-center justify-between text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>
          <span>
            Preview may be limited due to browser security restrictions
          </span>
          <a
            href={projectUrl}
            target="_blank"
            rel="noopener noreferrer"
                className={`${theme === 'dark' ? 'text-green-600 hover:text-green-700' : 'text-purple-600 hover:text-purple-700'} font-medium`}
          >
            Open Full Site →
          </a>
        </div>
      </div>
    </motion.div>
  );
}; 