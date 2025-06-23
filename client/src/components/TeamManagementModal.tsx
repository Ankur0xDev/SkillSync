import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Users, 
  UserPlus,
  UserMinus,
  Check,
  X as XIcon,
  Crown,
  Shield,
  User
} from 'lucide-react';
import type { Project} from '../types';
import { useTheme } from '../Contexts/ThemeContext';  

interface TeamManagementModalProps {
  project: Project;
  onClose: () => void;
  onAcceptRequest: (projectId: string, requestId: string) => void;
  onRejectRequest: (projectId: string, requestId: string) => void;
  onRemoveMember: (projectId: string, memberId: string) => void;
}

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({ 
  project, 
  onClose, 
  onAcceptRequest, 
  onRejectRequest, 
  onRemoveMember 
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'members'>('requests');
  const { theme } = useTheme();
  const pendingRequests = project.teamRequests.filter(req => req.status === 'pending');
  const teamMembers = project.teamMembers;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      default:
        return 'Member';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Team Management</h2>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-500'}`}>{project.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-400'} hover:text-gray-600 transition-colors`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Stats */}
          <div className= "px-6 py-4 bg-gray-50 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{teamMembers.length}</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>Team Members</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-600' : 'text-blue-600'}`}>{pendingRequests.length}</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>Pending Requests</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{project.teamSettings.maxTeamSize}</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>Max Team Size</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className={`flex border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'requests'
                  ? `text-blue-600 border-b-2 border-blue-600 ${theme === 'dark' ? 'dark:text-blue-600' : ''}`
                  : `text-gray-500 hover:text-gray-700 ${theme === 'dark' ? 'dark:text-gray-500 dark:hover:text-gray-400' : ''}`
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <UserPlus className="w-4 h-4" />
                <span>Requests ({pendingRequests.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'members'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Members ({teamMembers.length})</span>
              </div>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {activeTab === 'requests' ? (
              <div className="space-y-4">
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-2`}>No Pending Requests</h3>
                    <p className={`text-gray-600 ${theme === 'dark' ? 'text-gray-400' : ''}`}>No one has requested to join your team yet.</p>
                  </div>
                ) : (
                  pendingRequests.map((request) => (
                    <div key={request._id} className={`bg-gray-50 ${theme === 'dark' ? 'bg-gray-700' : ''} rounded-lg p-4`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            {request.user.profilePicture ? (
                              <img 
                                src={request.user.profilePicture} 
                                alt={request.user.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span className="text-white font-bold text-sm">
                                {request.user.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{request.user.name}</h4>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onAcceptRequest(project._id, request._id)}
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                            title="Accept Request"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onRejectRequest(project._id, request._id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Reject Request"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {request.message && (
                        <p className={`text-gray-700 ${theme === 'dark' ? 'text-gray-400' : ''} mb-3`}>{request.message}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {request.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {teamMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-2`}>No Team Members</h3>
                    <p className={`text-gray-600 ${theme === 'dark' ? 'text-gray-400' : ''}`}>You haven't added any team members yet.</p>
                  </div>
                ) : (
                  teamMembers.map((member) => (
                    <div key={member._id} className={`bg-gray-50 ${theme === 'dark' ? 'bg-gray-700' : ''} rounded-lg p-4`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                            {member.user.profilePicture ? (
                              <img 
                                src={member.user.profilePicture} 
                                alt={member.user.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span className="text-white font-bold text-sm">
                                {member.user.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                                  <h4 className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{member.user.name}</h4>
                              {getRoleIcon(member.role)}
                              <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{getRoleLabel(member.role)}</span>
                            </div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {member.role !== 'owner' && (
                          <button
                            onClick={() => onRemoveMember(project._id, member.user._id)}
                            className={`p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors ${theme === 'dark' ? 'bg-red-900 text-red-400 hover:bg-red-800' : ''}`}
                            title="Remove Member"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      {member.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {member.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className={`bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium ${theme === 'dark' ? 'bg-green-900 text-green-400 hover:bg-green-800' : ''}`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 