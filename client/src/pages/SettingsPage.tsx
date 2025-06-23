import React from 'react';
import { Settings } from '../components/Settings';
import { ProtectedRoute } from '../components/ProtectedRoute';
// import { useTheme } from '../Contexts/ThemeContext';


export const SettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    </div>
  );
};

export default SettingsPage; 