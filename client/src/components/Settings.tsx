import React, { useState } from 'react';
import { useTheme } from '../Contexts/ThemeContext';
import { motion } from 'framer-motion';
import { AppearanceTab } from './AppearanceTab';
import { 
  Settings as SettingsIcon, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Shield,
  Bell,
  Palette,
  Globe,
  Trash2
} from 'lucide-react';
import { useAuth } from '../Contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { LoadingSpinner } from './LoadingSpinner';

interface SettingsProps {
  onClose?: () => void;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface EmailVerificationData {
  email: string;
  otp: string;
}

interface ChangeEmailData {
  newEmail: string;
  otp: string;
}

export const Settings: React.FC<SettingsProps> = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  // const [showDeletionOtp, setShowDeletionOtp] = useState(false);
  const [deletionOtp, setDeletionOtp] = useState('');
  const [deletionStep, setDeletionStep] = useState<'initial' | 'otp-sent' | 'confirming'>('initial');
  
  // New state variables for change email functionality
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [changeEmailData, setChangeEmailData] = useState<ChangeEmailData>({
    newEmail: '',
    otp: ''
  });
  const [changeEmailStep, setChangeEmailStep] = useState<'initial' | 'otp-sent' | 'confirming'>('initial');
  const [emailMode, setEmailMode] = useState<'verify' | 'change'>('verify');
  
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: user?.privacySettings?.profileVisibility || 'public',
    showOnlineStatus: user?.privacySettings?.showOnlineStatus ?? true
  });
  
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [verificationData] = useState<EmailVerificationData>({
    email: user?.email || '',
    otp: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: user?.notificationSettings?.emailNotifications ?? true,
    connectionRequests: user?.notificationSettings?.connectionRequests ?? true,
    projectUpdates: user?.notificationSettings?.projectUpdates ?? true
  });

  const { theme } = useTheme();


  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Globe },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 }
  ];

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await axios.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (emailMode === 'change') {
      // Handle change email flow
      if (!changeEmailData.newEmail) {
        toast.error('Please enter a new email address');
        return;
      }
      
      if (changeEmailData.newEmail === user?.email) {
        toast.error('New email must be different from current email');
        return;
      }

      setLoading(true);
      try {
        await axios.post('/users/send-change-email-otp', {
          newEmail: changeEmailData.newEmail
        });
        
        setChangeEmailStep('otp-sent');
        setShowChangeEmail(true);
        toast.success('Verification email sent to your new email address');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to send verification email');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Handle email verification flow
    if (!verificationData.email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/users/send-verification-email', {
        email: verificationData.email
      });
      
      setPendingEmail(verificationData.email);
      setShowOtp(true);
      toast.success('Verification email sent successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!user?.isVerified) {
      toast.error('Please verify your email first');
      return;
    }
    
    setEmailMode('change');
    setShowChangeEmail(true);
    setChangeEmailStep('initial');
    setChangeEmailData({ newEmail: '', otp: '' });
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/users/verify-email', {
        email: pendingEmail,
        otp: otp
      });
      
      updateUser(response.data.user);
      setShowOtp(false);
      setOtp('');
      toast.success('Email verified successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (changeEmailData.otp.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    setChangeEmailStep('confirming');
    try {
      const response = await axios.put('/users/change-email', {
        newEmail: changeEmailData.newEmail,
        otp: changeEmailData.otp
      });
      
      updateUser(response.data.user);
      setShowChangeEmail(false);
      setChangeEmailData({ newEmail: '', otp: '' });
      setChangeEmailStep('initial');
      setEmailMode('verify');
      toast.success('Email changed successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change email');
      setChangeEmailStep('otp-sent');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelChangeEmail = () => {
    setShowChangeEmail(false);
    setChangeEmailData({ newEmail: '', otp: '' });
    setChangeEmailStep('initial');
    setEmailMode('verify');
  };

  const handleDeleteAccount = async () => {
    if (deletionStep === 'initial') {
      if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return;
      }

      setLoading(true);
      try {
        await axios.post('/users/send-deletion-otp');
        setDeletionStep('otp-sent');
        toast.success('Account deletion OTP sent to your email. Please check your inbox.');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to send deletion OTP');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleConfirmDeletion = async () => {
    if (deletionOtp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    setDeletionStep('confirming');
    try {
      await axios.delete('/users/account', {
        data: { otp: deletionOtp }
      });
      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
      setDeletionStep('otp-sent');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDeletion = () => {
    setDeletionStep('initial');
    setDeletionOtp('');
    // setShowDeletionOtp(false);
  };

  const handlePrivacySettingsUpdate = async () => {
    setLoading(true);
    try {
      const response = await axios.put('/users/privacy-settings', privacySettings);
      updateUser({ ...user, privacySettings: response.data.privacySettings });
      toast.success('Privacy settings updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const newSettings = { ...notificationSettings, [name]: checked };
    setNotificationSettings(newSettings);
    setLoading(true);
    try {
      await axios.put('/users/notification-settings', newSettings);
      toast.success('Notification settings updated');
      if (user) {
        updateUser({ ...user, notificationSettings: { ...user.notificationSettings, ...newSettings } });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const renderAccountTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Profile Information */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border dark:border-gray-700`}>
        <h3 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-lg font-semibold mb-4`}>Profile Information</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <User className="w-8 h-8" />
                </div>
              )}
            </div>
            <div>
              <h4 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} font-medium`}>{user?.name}</h4>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{user?.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                {user?.isVerified ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                )}
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
                  {user?.isVerified ? 'Verified' : 'Not verified'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/profile/edit')}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            <span>Edit Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Email Verification */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border dark:border-gray-700`}>
        <h3 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-lg font-semibold mb-4`}>Email Verification</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Current email: {user?.email}</p>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs mt-1`}>
                {user?.isVerified 
                  ? 'Your email is verified and secure' 
                  : 'Verify your email to secure your account'
                }
              </p>
            </div>
            {!user?.isVerified ? (
              <button
                onClick={() => {
                  setEmailMode('verify');
                  handleSendVerificationEmail();
                }}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Verify Email'}
              </button>
            ) : (
              <button
                onClick={handleChangeEmail}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Change Email'}
              </button>
            )}
          </div>
          
          {/* Email Verification OTP Form */}
          {showOtp && emailMode === 'verify' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border rounded-lg p-4 bg-gray-50"
            >
              <p className="text-sm text-gray-600 mb-3">
                Enter the 6-digit code sent to {pendingEmail}
              </p>
              <form onSubmit={handleVerifyEmail} className="space-y-3">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  maxLength={6}
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Verify'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtp(false);
                      setOtp('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Change Email Form */}
          {showChangeEmail && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border rounded-lg p-4 bg-gray-50"
            >
              {changeEmailStep === 'initial' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Email Address
                    </label>
                    <input
                      type="email"
                      value={changeEmailData.newEmail}
                      onChange={(e) => setChangeEmailData(prev => ({ ...prev, newEmail: e.target.value }))}
                      placeholder="Enter new email address"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEmailMode('change');
                        handleSendVerificationEmail();
                      }}
                      disabled={loading || !changeEmailData.newEmail}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
                    >
                      {loading ? <LoadingSpinner size="sm" /> : 'Send Verification'}
                    </button>
                    <button
                      onClick={handleCancelChangeEmail}
                      disabled={loading}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {changeEmailStep === 'otp-sent' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Enter the 6-digit code sent to {changeEmailData.newEmail}
                  </p>
                  <form onSubmit={handleConfirmChangeEmail} className="space-y-3">
                    <input
                      type="text"
                      value={changeEmailData.otp}
                      onChange={(e) => setChangeEmailData(prev => ({ 
                        ...prev, 
                        otp: e.target.value.replace(/\D/g, '').slice(0, 6) 
                      }))}
                      placeholder="Enter 6-digit code"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      maxLength={6}
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        disabled={loading || changeEmailData.otp.length !== 6}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
                      >
                        {loading ? <LoadingSpinner size="sm" /> : 'Confirm Change'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelChangeEmail}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {changeEmailStep === 'confirming' && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <LoadingSpinner size="sm" />
                  <span>Changing your email...</span>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderSecurityTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Change Password */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border dark:border-gray-700`}>
        <h3 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-lg font-semibold mb-4`}>Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} block text-sm font-medium  mb-2`}>
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'} w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10`}
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} block text-sm font-medium  mb-2`}>
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'} w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10`}
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} block text-sm font-medium  mb-2`}>
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className={`${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-900'} w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10`}
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-purple-600 flex justify-center items-center text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Security Tips */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'} rounded-xl p-6 border border-blue-200`}>
        <h3 className={`${theme === 'dark' ? 'text-white' : 'text-blue-900'} text-lg font-semibold mb-3`}>Security Tips</h3>
        <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-blue-800'}`}>
          <li>• Use a strong password with at least 8 characters</li>
          <li>• Include a mix of letters, numbers, and symbols</li>
          <li>• Never share your password with anyone</li>
          <li>• Enable two-factor authentication if available</li>
        </ul>
      </div>
    </motion.div>
  );

  const renderNotificationsTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border dark:border-gray-700`}>
        <h3 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-lg font-semibold mb-4`}>Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} font-medium`}>Email Notifications</h4>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                name="emailNotifications"
                checked={notificationSettings.emailNotifications}
                onChange={handleNotificationToggle}
                disabled={loading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} font-medium`}>Connection Requests</h4>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Get notified when someone wants to connect</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                name="connectionRequests"
                checked={notificationSettings.connectionRequests}
                onChange={handleNotificationToggle}
                disabled={loading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} font-medium`}>Project Updates</h4>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Receive updates about your projects</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                name="projectUpdates"
                checked={notificationSettings.projectUpdates}
                onChange={handleNotificationToggle}
                disabled={loading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderPrivacyTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border dark:border-gray-700`}>
        <h3 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-lg font-semibold mb-4`}>Privacy Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} font-medium`}>Profile Visibility</h4>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Control who can see your profile</p>
            </div>
            <select 
              value={privacySettings.profileVisibility}
              onChange={(e) => setPrivacySettings(prev => ({
                ...prev,
                profileVisibility: e.target.value as 'public' | 'connections' | 'private'
              }))}
              className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
            >
              <option value="public">Public</option>
              <option value="connections">Connections Only</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} font-medium`}>Show Online Status</h4>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Let others see when you're online</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={privacySettings.showOnlineStatus}
                onChange={(e) => setPrivacySettings(prev => ({
                  ...prev,
                  showOnlineStatus: e.target.checked
                }))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="pt-4 border-t">
            <button
              onClick={handlePrivacySettingsUpdate}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Save Privacy Settings'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderDangerTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-red-50'} rounded-xl p-6 border border-red-200`}>
        <h3 className={`${theme === 'dark' ? 'text-white' : 'text-red-900'} text-lg font-semibold mb-4`}>Danger Zone</h3>
        <div className="space-y-4">
          <div>
            <h4 className={`${theme === 'dark' ? 'text-white' : 'text-red-900'} font-medium`}>Delete Account</h4>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-red-700'} text-sm mt-1`}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            
            {deletionStep === 'initial' && (
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Delete Account'}
              </button>
            )}

            {deletionStep === 'otp-sent' && (
              <div className="mt-4 space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    We've sent a 6-digit OTP to your email address. Please check your inbox and enter the code below to confirm account deletion.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Enter 6-digit OTP
                  </label>
                  <input
                    type="text"
                    value={deletionOtp}
                    onChange={(e) => setDeletionOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-center text-lg font-mono"
                    maxLength={6}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleConfirmDeletion}
                    disabled={loading || deletionOtp.length !== 6}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Confirm Deletion'}
                  </button>
                  <button
                    onClick={handleCancelDeletion}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {deletionStep === 'confirming' && (
              <div className="mt-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <LoadingSpinner size="sm" />
                  <span>Deleting your account...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return renderAccountTab();
      case 'security':
        return renderSecurityTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'appearance':
        return <AppearanceTab />;
      case 'privacy':
        return renderPrivacyTab();
      case 'danger':
        return renderDangerTab();
      default:
        return renderAccountTab();
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} min-h-screen transition-colors duration-200 py-8`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <SettingsIcon className="w-8 h-8 text-purple-600" />
            <h1 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-3xl font-bold`}>Settings</h1>
          </div>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white '} rounded-xl shadow-sm border p-4`}>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 ${theme==='dark' ? '' : 'text-gray-600'} px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'text-gray-300 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 