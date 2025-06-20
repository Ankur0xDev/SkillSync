import React, { useState } from 'react';
import GitHubStats from './GitHubStats';
import { LinkedInStats } from './LinkedInStats';
import type { User } from '../types';

interface SocialStatsProps {
  user: User;
}

type StatsType = 'github' | 'linkedin';

export const SocialStats: React.FC<SocialStatsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<StatsType>('github');

  const hasGitHub = !!user.github;
  const hasLinkedIn = !!user.linkedin;

  if (!hasGitHub && !hasLinkedIn) {
    return null;
  }

  return (
    <div className="mb-8 w-[64vw]">
      {/* Tabs */}
      <div className="flex items-center w-full justify-between mb-4">
        <div className="flex space-x-4">
          {hasGitHub && (
            <button
              onClick={() => setActiveTab('github')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'github'
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              GitHub Activity
            </button>
          )}
          {hasLinkedIn && (
            <button
              onClick={() => setActiveTab('linkedin')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'linkedin'
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              LinkedIn Activity
            </button>
          )}
        </div>
        {activeTab === 'github' && user.github && (
          <a
            href={user.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 dark:text-primary-400 hover:underline flex items-center"
          >
            <span className="text-blue-500">View GitHub Profile</span>
            <svg className="w-4 h-4 ml-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
        {activeTab === 'linkedin' && user.linkedin && (
          <a
            href={user.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 dark:text-primary-400 hover:underline flex items-center"
          >
            <span className="text-blue-500">View LinkedIn Profile</span>
            <svg className="w-4 h-4 ml-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>

      {/* Stats Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {activeTab === 'github' && user.github && (
          <GitHubStats githubUrl={user.github} />
        )}
        {activeTab === 'linkedin' && user.linkedin && (
          <LinkedInStats linkedinUrl={user.linkedin} />
        )}
      </div>
    </div>
  );
}; 