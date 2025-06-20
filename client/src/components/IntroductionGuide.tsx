import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, UserPlus, User, Users, Code2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../Contexts/AuthContext';

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  buttonText: string;
}

export const IntroductionGuide: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  // const { user } = useAuth();

  useEffect(() => {
    // Clear the guide state when component mounts
    localStorage.removeItem('hasSeenGuide');
    setIsVisible(true);
  }, []);

  const steps: Step[] = [
    {
      title: "Welcome to SkillSync! 👋",
      description: "Your journey to finding the perfect coding partner starts here. Let us guide you through the process.",
      icon: <UserPlus className="w-6 h-6" />,
      action: () => setCurrentStep(1),
      buttonText: "Let's Begin"
    },
    {
      title: "Create Your Profile",
      description: "First, let's set up your profile. Add your skills, experience, and what you're looking for in a coding partner.",
      icon: <User className="w-6 h-6" />,
      action: () => navigate('/profile/edit'),
      buttonText: "Set Up Profile"
    },
    {
      title: "Find Your Match",
      description: "Browse through developers and find your perfect coding partner based on skills and interests.",
      icon: <Users className="w-6 h-6" />,
      action: () => navigate('/matches'),
      buttonText: "Find Matches"
    },
    {
      title: "Start Collaborating",
      description: "Connect with other developers, join the community chat, and start building amazing projects together.",
      icon: <Code2 className="w-6 h-6" />,
      action: () => navigate('/community'),
      buttonText: "Join Community"
    }
  ];

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenGuide', 'true');
  };

  // const handleNext = () => {
  //   if (currentStep < steps.length - 1) {
  //     setCurrentStep(currentStep + 1);
  //   } else {
  //     handleClose();
  //   }
  // };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 right-6 z-50 w-96"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-purple-100"
        >
          {/* Progress bar */}
          <div className="h-1 bg-gray-200">
            <motion.div
              className="h-full bg-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white">
                  {steps[currentStep].icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {steps[currentStep].title}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-6">
              {steps[currentStep].description}
            </p>

            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="flex space-x-3">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={steps[currentStep].action}
                  className="bg-purple-600 text-white px-4 py-1.5 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 text-sm font-semibold"
                >
                  <span>{steps[currentStep].buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 