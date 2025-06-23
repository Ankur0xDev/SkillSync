import { useEffect, useState } from 'react';
import { fetchGitHubData } from '../utils/github';
import { Star, GitFork, Users, Code } from 'lucide-react';
import { useTheme } from '../Contexts/ThemeContext';
import type { GitHubStats as GitHubStatsType } from '../types';

interface GitHubStatsProps {
  githubUrl: string;
}

const GitHubStats = ({ githubUrl }: GitHubStatsProps) => {
  const { theme } = useTheme();
    const [stats, setStats] = useState<GitHubStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGitHubData = async () => {
      try {
        setLoading(true);
        const data = await fetchGitHubData(githubUrl);
        setStats(data);
        setError(null);
      } catch (err) {
        setError('Failed to load GitHub data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (githubUrl) {
      loadGitHubData();
    }
  }, [githubUrl]);

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
      <div className={`${theme === 'dark' ? 'text-red-400' : 'text-red-500'} text-sm`}>
        {error || 'No GitHub data available'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg shadow`}>
          <div className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-primary-600" />
            <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Repos</span>
          </div>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mt-2`}>
            {stats.publicRepos}
          </p>
        </div>
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg shadow`}>
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Stars</span>
          </div>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mt-2`}>
            {stats.totalStars}
          </p>
        </div>
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg shadow`}>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Followers</span>
          </div>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mt-2`}>
            {stats.followers}
          </p>
        </div>
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg shadow`}>
          <div className="flex items-center space-x-2">
            <GitFork className="w-5 h-5 text-green-500" />
            <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Following</span>
          </div>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mt-2`}>
            {stats.following}
          </p>
        </div>
      </div>

      {/* Top Languages */}
      <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-6 rounded-lg shadow`}>
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
          Top Languages
        </h3>
        <div className="space-y-2">
          {Object.entries(stats.topLanguages).map(([language, count]) => (
            <div key={language} className="flex items-center justify-between">
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{language}</span>
              <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-medium`}>
                {count} repos
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Repositories */}
      <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-6 rounded-lg shadow`}>
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
          Recent Repositories
        </h3>
        <div className="space-y-4">
          {stats.recentRepos.map((repo) => (
            <a
              key={repo.name}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block p-4 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg hover:bg-gray-50 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
            >
              <div className="flex items-center justify-between">
                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {repo.name}
                </h4>
                <div className="flex items-center space-x-2">
                  {repo.language && (
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {repo.language}
                    </span>
                  )}
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {repo.stars}
                    </span>
                  </div>
                </div>
              </div>
              {repo.description && (
                <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {repo.description}
                </p>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GitHubStats; 