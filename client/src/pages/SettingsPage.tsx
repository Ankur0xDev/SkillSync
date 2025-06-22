import React from 'react';
import { Settings } from '../components/Settings';
import { ProtectedRoute } from '../components/ProtectedRoute';

export const SettingsPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  );
};

export default SettingsPage; 