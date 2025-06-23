import React, { useState } from 'react';
import { useTheme } from '../Contexts/ThemeContext';
import { 
  Shield, 
  Lock, 
  FileText, 
  AlertTriangle,
  UserCheck,
  Scale,
  BookOpen,
  MessageSquare,
  Ban,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const sections: Section[] = [
  { id: 'introduction', title: 'Introduction', icon: <FileText className="w-5 h-5" /> },
  { id: 'eligibility', title: 'Eligibility', icon: <UserCheck className="w-5 h-5" /> },
  { id: 'account', title: 'Account Terms', icon: <Lock className="w-5 h-5" /> },
  { id: 'conduct', title: 'User Conduct', icon: <Scale className="w-5 h-5" /> },
  { id: 'content', title: 'Content Guidelines', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'communication', title: 'Communication Rules', icon: <MessageSquare className="w-5 h-5" /> },
  { id: 'prohibited', title: 'Prohibited Activities', icon: <Ban className="w-5 h-5" /> },
  { id: 'termination', title: 'Termination', icon: <AlertTriangle className="w-5 h-5" /> },
  { id: 'disclaimer', title: 'Disclaimer', icon: <Shield className="w-5 h-5" /> }
];

export const TermsOfServicePage: React.FC = () => {
  const { theme } = useTheme();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['introduction']));

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setExpandedSections(prev => new Set([...prev, sectionId]));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6 overflow-y-auto`}>
        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-6`}>Quick Navigation</h2>
        <nav className="space-y-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`flex items-center space-x-2 w-full text-left px-3 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-100 hover:text-green-600' : 'hover:bg-purple-50 text-gray-600 hover:text-purple-600'} transition-colors`}
            >
              {section.icon}
              <span>{section.title}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`ml-64 py-12 px-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Terms of Service</h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Introduction */}
          <div id="introduction" className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-8 mb-8`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-purple-600" />
                <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Introduction</h2>
              </div>
              <button
                onClick={() => toggleSection('introduction')}
                className={`${theme === 'dark' ? 'text-gray-100 hover:text-gray-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {expandedSections.has('introduction') ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            {expandedSections.has('introduction') && (
              <div className="space-y-4">
                <p className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>
                  Welcome to SkillSync. These Terms of Service ("Terms") govern your access to and use of the SkillSync platform, including our website, services, and applications.
                </p>
                <p className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>
                  By accessing or using our platform, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the platform.
                </p>
              </div>
            )}
          </div>

          {/* Eligibility */}
          <div id="eligibility" className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-8 mb-8`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-6 h-6 text-purple-600" />
                <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Eligibility</h2>
              </div>
              <button
                onClick={() => toggleSection('eligibility')}
                className={`${theme === 'dark' ? 'text-gray-100 hover:text-gray-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {expandedSections.has('eligibility') ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            {expandedSections.has('eligibility') && (
              <div className="space-y-4">
                <p className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>
                  To use SkillSync, you must:
                </p>
                <ul className={`list-disc list-inside ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'} space-y-2`}>
                  <li>Be at least 13 years of age</li>
                  <li>Have the legal capacity to enter into these Terms</li>
                  <li>Not be prohibited from using the platform under applicable laws</li>
                  <li>Provide accurate and complete registration information</li>
                </ul>
              </div>
            )}
          </div>

          {/* Account Terms */}
          <div id="account" className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-8 mb-8`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Lock className="w-6 h-6 text-purple-600" />
                <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Account Terms</h2>
              </div>
              <button
                onClick={() => toggleSection('account')}
                className={`${theme === 'dark' ? 'text-gray-100 hover:text-gray-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {expandedSections.has('account') ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            {expandedSections.has('account') && (
              <div className="space-y-4">
                <p className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>
                  When creating an account with us, you must provide accurate and complete information. You are responsible for:
                </p>
                <ul className={`list-disc list-inside ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'} space-y-2`}>
                  <li>Maintaining the security of your account</li>
                  <li>All activities that occur under your account</li>
                  <li>Keeping your contact information up to date</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                </ul>
              </div>
            )}
          </div>

          {/* User Conduct */}
          <div id="conduct" className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-8 mb-8`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Scale className="w-6 h-6 text-purple-600" />
                <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>User Conduct</h2>
              </div>
              <button
                onClick={() => toggleSection('conduct')}
                className={`${theme === 'dark' ? 'text-gray-100 hover:text-gray-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {expandedSections.has('conduct') ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            {expandedSections.has('conduct') && (
              <div className="space-y-4">
                <p className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>
                  You agree to use the platform in accordance with these Terms and applicable laws. You will:
                </p>
                <ul className={`list-disc list-inside ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'} space-y-2`}>
                  <li>Respect other users' rights and privacy</li>
                  <li>Provide accurate and truthful information</li>
                  <li>Use the platform for its intended purposes</li>
                  <li>Not engage in any harmful or disruptive behavior</li>
                </ul>
              </div>
            )}
          </div>

          {/* Content Guidelines */}
          <div id="content" className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-8 mb-8`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-purple-600" />
                <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Content Guidelines</h2>
              </div>
              <button
                onClick={() => toggleSection('content')}
                className={`${theme === 'dark' ? 'text-gray-100 hover:text-gray-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {expandedSections.has('content') ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            {expandedSections.has('content') && (
              <div className="space-y-4">
                <p className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>
                  When posting content on our platform, you must ensure that it:
                </p>
                <ul className={`list-disc list-inside ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'} space-y-2`}>
                  <li>Is accurate and not misleading</li>
                  <li>Does not infringe on others' rights</li>
                  <li>Is appropriate for a professional environment</li>
                  <li>Complies with our community standards</li>
                </ul>
              </div>
            )}
          </div>

          {/* Communication Rules */}
          <div id="communication" className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-8 mb-8`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-6 h-6 text-purple-600" />
                <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Communication Rules</h2>
              </div>
              <button
                onClick={() => toggleSection('communication')}
                className={`${theme === 'dark' ? 'text-gray-100 hover:text-gray-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {expandedSections.has('communication') ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            {expandedSections.has('communication') && (
              <div className="space-y-4">
                <p className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>
                  When communicating with other users, you must:
                </p>
                <ul className={`list-disc list-inside ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'} space-y-2`}>
                  <li>Be respectful and professional</li>
                  <li>Not engage in harassment or bullying</li>
                  <li>Not send spam or unsolicited messages</li>
                  <li>Respect others' privacy and boundaries</li>
                </ul>
              </div>
            )}
          </div>

          {/* Prohibited Activities */}
          <div id="prohibited" className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-8 mb-8`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Ban className="w-6 h-6 text-purple-600" />
                <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Prohibited Activities</h2>
              </div>
              <button
                onClick={() => toggleSection('prohibited')}
                className={`${theme === 'dark' ? 'text-gray-100 hover:text-gray-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {expandedSections.has('prohibited') ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            {expandedSections.has('prohibited') && (
              <div className="space-y-4">
                <p className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>
                  You are prohibited from:
                </p>
                <ul className={`list-disc list-inside ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'} space-y-2`}>
                  <li>Using the platform for illegal purposes</li>
                  <li>Attempting to gain unauthorized access</li>
                  <li>Interfering with platform operations</li>
                  <li>Sharing harmful or malicious content</li>
                  <li>Impersonating others</li>
                </ul>
              </div>
            )}
          </div>

          {/* Termination */}
          <div id="termination" className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-8 mb-8`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-purple-600" />
                <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Termination</h2>
              </div>
              <button
                onClick={() => toggleSection('termination')}
                className={`${theme === 'dark' ? 'text-gray-100 hover:text-gray-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {expandedSections.has('termination') ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            {expandedSections.has('termination') && (
              <div className="space-y-4">
                <p className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>
                  We may terminate or suspend your account:
                </p>
                <ul className={`list-disc list-inside ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'} space-y-2`}>
                  <li>For violations of these Terms</li>
                  <li>For fraudulent or illegal activities</li>
                  <li>At our sole discretion</li>
                  <li>With or without prior notice</li>
                </ul>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div id="disclaimer" className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-8`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-purple-600" />
                <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Disclaimer</h2>
              </div>
              <button
                onClick={() => toggleSection('disclaimer')}
                className={`${theme === 'dark' ? 'text-gray-100 hover:text-gray-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {expandedSections.has('disclaimer') ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            {expandedSections.has('disclaimer') && (
              <div className="space-y-4">
                <p className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>
                  The platform is provided "as is" without any warranties. We are not responsible for:
                </p>
                <ul className={`list-disc list-inside ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'} space-y-2`}>
                  <li>Accuracy of user-provided content</li>
                  <li>Actions of other users</li>
                  <li>Service interruptions</li>
                  <li>Data loss or security breaches</li>
                </ul>
                <div className="mt-6">
                    <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Contact Us</h3>
                  <p className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'}`}>
                    If you have any questions about these Terms, please contact us at:
                  </p>
                  <a href="mailto:ankurgrewal07@gmail.com" className={`${theme === 'dark' ? 'text-green-600 hover:text-green-700' : 'text-purple-600 hover:text-purple-700'}`}>
                    ankurgrewal07@gmail.com
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 