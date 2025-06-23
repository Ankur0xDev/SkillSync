import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../Contexts/ThemeContext';
import {
  Code2,
  Search,
  Users,
  Heart,
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
  // Bell,
  FolderOpen,
  Settings
} from 'lucide-react';
import { useAuth } from '../Contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { theme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/search', label: 'Find Developers', icon: Search },
    { to: '/matches', label: 'Matches', icon: Heart },
    { to: '/connections', label: 'Connections', icon: Users },
    { to: '/projects', label: 'Projects', icon: FolderOpen },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={` ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white/80 backdrop-blur-md border-b border-gray-200 '}  border-b border-gray-200  sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SkillSync
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Find Your Coding Partner</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 relative ${isActive(link.to)
                        ? 'text-purple-600 bg-purple-50'
                        : `${theme === 'dark' ? 'bg-gray-800 text-gray-100 hover:bg-gray-700 hover:text-purple-600' : 'bg-white text-gray-700 bg-blue-400 hover:bg-gray-100  '}`
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                    {isActive(link.to) && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full"
                        layoutId="activeTab"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                {/* <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
                </button> */}
                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-white cursor-pointer">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} cursor-pointer`}>{user?.name}</span>
                  </button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className={`absolute right-0 mt-2 w-48 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white text-gray-700'} rounded-xl shadow-lg border border-gray-200 py-2 z-50`}
                      >
                        <Link
                          to="/profile"
                          className={`flex items-center rounded-lg space-x-3 px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-100 hover:bg-gray-500' : 'text-gray-700'} `}
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/dashboard"
                          className={`flex items-center rounded-lg space-x-3 px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-100 hover:bg-gray-500' : 'text-gray-700'} `}
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/settings"
                          className={`flex items-center rounded-lg space-x-3 px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-100 hover:bg-gray-500' : 'text-gray-700'} `}
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                        <hr className="my-2" />
                        <button
                          onClick={handleLogout}
                          className={`flex items-center rounded-lg space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 ${theme === 'dark' ? 'hover:bg-red-50' : ''} w-full text-left`}
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/search"
                  className="text-gray-600 dark:text-gray-400 hover:text-purple-600 font-medium"
                >
                  Browse Developers
                </Link>
                <Link
                  to="/auth"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-lg font-medium hover:scale-105 transition-transform"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 py-4"
            >
              {isAuthenticated ? (
                <div className="space-y-2">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive(link.to)
                            ? 'text-purple-600 bg-purple-50'
                            : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                  <Link
                    to="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-600 dark:text-gray-400 hover:text-purple-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                  <hr className="my-4" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 w-full text-left rounded-lg"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/search"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-purple-600"
                  >
                    Browse Developers
                  </Link>
                  <Link
                    to="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2 text-purple-600 font-medium"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};