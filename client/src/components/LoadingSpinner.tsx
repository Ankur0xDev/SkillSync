import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../Contexts/ThemeContext';  

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const { theme } = useTheme();
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <div className={`w-full h-full border-2 ${theme === 'dark' ? 'border-purple-200 border-t-purple-600' : 'border-purple-200 border-t-purple-600'} rounded-full`}></div>
    </motion.div>
  );
};