import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../Contexts/ThemeContext';
import { Code2, Heart, Github, Twitter, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { theme } = useTheme();
  return (
    <footer className={`${theme === 'dark' ? ' bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-10 h-10 ${theme === 'dark' ? 'bg-gradient-to-r from-green-600 to-blue-600' : 'bg-gradient-to-r from-purple-600 to-blue-600'} rounded-xl flex items-center justify-center`}>
                <Code2 className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>SkillSync</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Find Your Perfect Coding Partner</p>
              </div>
            </div>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-6 max-w-md`}>
              Connect with developers worldwide, collaborate on projects, and build amazing things together. 
              
            </p>
            <div className="flex space-x-4">
              <a href="#" className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}>
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}>
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}>
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`${  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} font-semibold mb-4`}>Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/search" className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}>Find Developers</Link></li>
              <li><Link to="/matches" className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}>Matches</Link></li>
              <li><Link to="/connections" className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}>Connections</Link></li>
              <li><Link to="/dashboard" className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}>Dashboard</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
              <h4 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} font-semibold mb-4`}>Support</h4>
            <ul className="space-y-2">
              <li><a href="/help" className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}>Help Center</a></li>
              <li><a href="/community" className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}>Community</a></li>
              <li><a href="/privacy" className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}>Privacy Policy</a></li>
              <li><a href="/terms" className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}>Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className={`${theme === 'dark' ? 'border-t border-gray-700' : 'border-t border-gray-200'} mt-12 pt-8 flex flex-col md:flex-row justify-between items-center`}>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
            © 2025 SkillSync. Made with <Heart className="w-4 h-4 inline text-red-500" /> for developers everywhere.
          </p>
          
        </div>
      </div>
    </footer>
  );
};