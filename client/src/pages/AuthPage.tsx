import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Code2 } from 'lucide-react';
import { useAuth } from '../Contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import axios from 'axios';
import { OtpInput } from '../components/OtpInput';
import { useNavigate } from 'react-router-dom';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading, verifyOtp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  // OTP state
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  // Add state for forgot password modal/flow
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'success'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Add this useEffect to show the toast when loading is true
  useEffect(() => {
    let toastId: string | undefined;
    if (loading) {
      toastId = toast.loading('Backend is deployed on Render.com. Please wait for at least 1 minute');
    }
    return () => {
      if (toastId) toast.dismiss(toastId);
    };
  }, [loading]);

  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    try {
      await axios.post('/users/resend-otp', { email: pendingEmail });
      toast.success('OTP resent to your email');
      setResendCooldown(30); // 30 seconds cooldown
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (!isLogin) {
        if (!formData.name) {
          toast.error('Name is required');
          setFormLoading(false);
          return;
        }
        // Register: send details, expect OTP step
        const res = await axios.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        toast.success(res.data.message || 'OTP sent to your email');
        setShowOtp(true);
        setPendingEmail(formData.email);
      } else {
        await login(formData.email, formData.password);
      }
    } catch (error: any) {
      const errorMsg =
        typeof error.response?.data?.message === 'string'
          ? error.response.data.message
          : Array.isArray(error.response?.data?.errors)
            ? error.response.data.errors.map((e: any) => e.msg).join(', ')
            : 'Registration/Login failed';

      toast.error(errorMsg);

      // If the error is about existing user or pending verification, show OTP form
      if (
        !isLogin &&
        errorMsg === 'A user already exists with this email or pending verification'
      ) {
        setShowOtp(true);
        setPendingEmail(formData.email);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setFormLoading(true);
    const success = await verifyOtp(pendingEmail, otp);
    setFormLoading(false);
    if (success) {
      navigate('/profile');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await axios.post('/auth/send-reset-password-otp', { email: forgotEmail });
      toast.success('If this email exists, a reset code has been sent.');
      setForgotStep('otp');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset code');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotOtp.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }
    if (forgotNewPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setForgotLoading(true);
    try {
      await axios.post('/auth/reset-password', {
        email: forgotEmail,
        otp: forgotOtp,
        newPassword: forgotNewPassword
      });
      toast.success('Password reset successful! You can now log in.');
      setForgotStep('success');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-md w-full space-y-8"
      >
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            {/* <div className='hidden'>{toast.loading('Backend is deployed on Render.com . Please wait for atleast 1 minute')}</div> */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
                <Code2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Join SkillSync'}
            </h2>
            <p className="text-gray-300">
              {isLogin
                ? 'Connect with your coding community'
                : 'Find your perfect coding partner'
              }
            </p>
          </div>

          {/* OTP Form */}
          {showOtp ? (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-center mb-2">
                  Enter the 6-digit OTP sent to your email
                </label>
                <OtpInput value={otp} onChange={setOtp} length={6} />
              </div>
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  disabled={resendCooldown > 0 || formLoading}
                  onClick={handleResendOtp}
                  className="text-sm text-purple-400 hover:text-purple-600 disabled:opacity-50"
                >
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>
              <button
                type="submit"
                disabled={formLoading}
                className="group relative cursor-pointer w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {formLoading ? (
                  <LoadingSpinner size="sm" className="text-white" />
                ) : (
                  <span>Verify OTP</span>
                )}
              </button>
            </form>
          ) : (
            // Main Auth Form
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="sr-only">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required={!isLogin}
                      value={formData.name}
                      onChange={handleInputChange}
                      className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300/30 placeholder-gray-400 text-white rounded-xl bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:z-10"
                      placeholder="Full Name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300/30 placeholder-gray-400 text-white rounded-xl bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:z-10"
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300/30 placeholder-gray-400 text-white rounded-xl bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:z-10"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
                {/* Forgot Password link */}
                {isLogin && !showOtp && (
                  <div className="text-right mt-2">
                    <button
                      type="button"
                      className="text-sm text-purple-300 hover:text-white focus:outline-none"
                      onClick={() => {
                        setShowForgot(true);
                        setForgotStep('email');
                        setForgotEmail('');
                        setForgotOtp('');
                        setForgotNewPassword('');
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="group relative cursor-pointer w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {formLoading ? (
                  <LoadingSpinner size="sm" className="text-white" />
                ) : (
                  <span >{isLogin ? 'Sign In' : 'Create Account'}</span>
                )}
              </button>
            </form>
          )}

          {/* Toggle */}
          {!showOtp && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {isLogin ? (
                  <>
                    Don't have an account?{' '}
                    <span className="font-medium cursor-pointer text-purple-400 hover:text-purple-300">
                      Sign up
                    </span>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <span className="font-medium text-purple-400 hover:text-purple-300">
                      Sign in
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        {/* Features */}
        <div className="text-center text-gray-300 space-y-2">
          <p className="text-sm">✨ Smart matching algorithm</p>
          <p className="text-sm">🌍 Global developer community</p>
        </div>
      </motion.div>

      {/* Forgot Password Modal/Box */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowForgot(false)}
              aria-label="Close"
            >
              ×
            </button>
            {forgotStep === 'email' && (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reset Password</h3>
                <p className="text-gray-600 text-sm mb-4">Enter your email address to receive a reset code.</p>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Email address"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {forgotLoading ? <LoadingSpinner size="sm" /> : 'Send Reset Code'}
                </button>
              </form>
            )}
            {forgotStep === 'otp' && (
              <form onSubmit={handleForgotReset} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Code & New Password</h3>
                <p className="text-gray-600 text-sm mb-4">Check your email for a 6-digit code.</p>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="6-digit code"
                  value={forgotOtp}
                  onChange={e => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                />
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="New password"
                  value={forgotNewPassword}
                  onChange={e => setForgotNewPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {forgotLoading ? <LoadingSpinner size="sm" /> : 'Reset Password'}
                </button>
              </form>
            )}
            {forgotStep === 'success' && (
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Password Reset!</h3>
                <p className="text-gray-600 text-sm mb-4">Your password has been reset. You can now log in with your new password.</p>
                <button
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  onClick={() => setShowForgot(false)}
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
