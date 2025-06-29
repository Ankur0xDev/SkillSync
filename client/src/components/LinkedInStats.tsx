import React, { useEffect, useState } from 'react';
import { fetchLinkedInData } from '../utils/linkedin';
import type { LinkedInStats as LinkedInStatsType } from '../types';
import { useTheme } from '../Contexts/ThemeContext';  

interface LinkedInStatsProps {
  linkedinUrl: string;
}

export const LinkedInStats: React.FC<LinkedInStatsProps> = ({ linkedinUrl }) => {
  const { theme } = useTheme();
  const [stats, setStats] = useState<LinkedInStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await fetchLinkedInData();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching LinkedIn stats:', err);
        setError('Failed to load LinkedIn stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [linkedinUrl]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className={`h-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded w-3/4`}></div>
        <div className={`h-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/2`}></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={`${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>
        {error || 'Failed to load LinkedIn stats'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg text-center`}>
          <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {stats.connections}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Connections</div>
        </div>
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg text-center`}>
          <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {stats.followers}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
        </div>
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg text-center`}>
          <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {stats.experience}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Years Experience</div>
        </div>
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg text-center`}>
          <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {stats.skills}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Skills</div>
        </div>
      </div>

      {/* Top Skills */}
      {stats.topSkills && stats.topSkills.length > 0 && (
        <div>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3`}>
            Top Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.topSkills.map((skill) => (
              <span
                key={skill}
                className={`px-3 py-1 ${theme === 'dark' ? 'text-white bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100' : 'text-primary-800 bg-primary-100'} rounded-full text-sm`}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats.recentActivity && stats.recentActivity.length > 0 && (
        <div>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3`}>
            Recent Activity
          </h3>
          <div className="space-y-3">
            {stats.recentActivity.map((activity, index) => (
              <div
                key={index}
                className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}
              >
                <div className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {activity.title}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  {activity.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 