import React,{useState} from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  UserCheck, 
  AlertTriangle,
  Cookie,
  Globe,
  FileText,
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
  { id: 'information', title: 'Information We Collect', icon: <Database className="w-5 h-5" /> },
  { id: 'usage', title: 'How We Use Your Information', icon: <Eye className="w-5 h-5" /> },
  { id: 'security', title: 'Data Security', icon: <Lock className="w-5 h-5" /> },
  { id: 'rights', title: 'Your Rights', icon: <UserCheck className="w-5 h-5" /> },
  { id: 'terms', title: 'Terms of Use', icon: <Shield className="w-5 h-5" /> },
  { id: 'cookies', title: 'Cookies Policy', icon: <Cookie className="w-5 h-5" /> },
  { id: 'international', title: 'International Data Transfers', icon: <Globe className="w-5 h-5" /> },
  { id: 'notices', title: 'Important Notices', icon: <AlertTriangle className="w-5 h-5" /> }
];

export const PrivacyPolicyPage: React.FC = () => {
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
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg p-6 overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Navigation</h2>
        <nav className="space-y-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 text-gray-600 hover:text-purple-600 transition-colors"
            >
              {section.icon}
              <span>{section.title}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 py-12 px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-lg text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Introduction */}
          <div id="introduction" className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Introduction</h2>
              </div>
              <button
                onClick={() => toggleSection('introduction')}
                className="text-gray-400 hover:text-gray-600"
              >
                {expandedSections.has('introduction') ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            {expandedSections.has('introduction') && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  At SkillSync, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                </p>
                <p className="text-gray-600">
                  Please read this privacy policy carefully. By using our service, you agree to the collection and use of information in accordance with this policy.
                </p>
              </div>
            )}
          </div>

          {/* Information We Collect */}
          <div id="information" className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Database className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Information We Collect</h2>
              </div>
              <button
                onClick={() => toggleSection('information')}
                className="text-gray-400 hover:text-gray-600"
              >
                {expandedSections.has('information') ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            {expandedSections.has('information') && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Name and contact information</li>
                    <li>Profile information (skills, experience, interests)</li>
                    <li>Profile and background pictures</li>
                    <li>Authentication data</li>
                    <li>Location information (country, city)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Usage Information</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Connection and interaction data</li>
                    <li>Chat messages and communications</li>
                    <li>Platform activity and preferences</li>
                    <li>Device and browser information</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* How We Use Your Information */}
          <div id="usage" className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Eye className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">How We Use Your Information</h2>
              </div>
              <button
                onClick={() => toggleSection('usage')}
                className="text-gray-400 hover:text-gray-600"
              >
                {expandedSections.has('usage') ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            {expandedSections.has('usage') && (
              <div className="space-y-4">
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>To provide and maintain our service</li>
                  <li>To notify you about changes to our service</li>
                  <li>To provide customer support</li>
                  <li>To gather analysis or valuable information to improve our service</li>
                  <li>To monitor the usage of our service</li>
                  <li>To detect, prevent and address technical issues</li>
                  <li>To facilitate connections between developers</li>
                </ul>
              </div>
            )}
          </div>

          {/* Data Security */}
          <div id="security" className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Lock className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Data Security</h2>
              </div>
              <button
                onClick={() => toggleSection('security')}
                className="text-gray-400 hover:text-gray-600"
              >
                {expandedSections.has('security') ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            {expandedSections.has('security') && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  We implement appropriate security measures to protect your personal information:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Encryption of sensitive data</li>
                  <li>Regular security assessments</li>
                  <li>Access controls and authentication</li>
                  <li>Secure data storage and transmission</li>
                  <li>Regular backups and disaster recovery</li>
                </ul>
              </div>
            )}
          </div>

          {/* User Rights */}
          <div id="rights" className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Your Rights</h2>
              </div>
              <button
                onClick={() => toggleSection('rights')}
                className="text-gray-400 hover:text-gray-600"
              >
                {expandedSections.has('rights') ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            {expandedSections.has('rights') && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to data processing</li>
                  <li>Export your data</li>
                  <li>Withdraw consent</li>
                </ul>
              </div>
            )}
          </div>

          {/* Terms of Use */}
          <div id="terms" className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Terms of Use</h2>
              </div>
              <button
                onClick={() => toggleSection('terms')}
                className="text-gray-400 hover:text-gray-600"
              >
                {expandedSections.has('terms') ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            {expandedSections.has('terms') && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  By using our platform, you agree to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account</li>
                  <li>Respect other users' privacy and rights</li>
                  <li>Not engage in harmful or malicious activities</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </div>
            )}
          </div>

          {/* Cookies Policy */}
          <div id="cookies" className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Cookie className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Cookies Policy</h2>
              </div>
              <button
                onClick={() => toggleSection('cookies')}
                className="text-gray-400 hover:text-gray-600"
              >
                {expandedSections.has('cookies') ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            {expandedSections.has('cookies') && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  We use cookies and similar tracking technologies to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Remember your preferences</li>
                  <li>Understand how you use our platform</li>
                  <li>Improve our services</li>
                  <li>Provide personalized content</li>
                  <li>Analyze traffic and usage patterns</li>
                </ul>
                <p className="text-gray-600 mt-4">
                  You can control cookies through your browser settings. However, disabling cookies may affect your experience on our platform.
                </p>
              </div>
            )}
          </div>

          {/* International Data Transfers */}
          <div id="international" className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Globe className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">International Data Transfers</h2>
              </div>
              <button
                onClick={() => toggleSection('international')}
                className="text-gray-400 hover:text-gray-600"
              >
                {expandedSections.has('international') ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            {expandedSections.has('international') && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data during such transfers.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Data transfer agreements</li>
                  <li>Standard contractual clauses</li>
                  <li>Adequacy decisions</li>
                  <li>Binding corporate rules</li>
                </ul>
              </div>
            )}
          </div>

          {/* Important Notices */}
          <div id="notices" className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Important Notices</h2>
              </div>
              <button
                onClick={() => toggleSection('notices')}
                className="text-gray-400 hover:text-gray-600"
              >
                {expandedSections.has('notices') ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            {expandedSections.has('notices') && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Changes to This Policy</h3>
                  <p className="text-gray-600">
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Us</h3>
                  <p className="text-gray-600">
                    If you have any questions about this Privacy Policy, please contact us at:
                  </p>
                  <a href="mailto:ankurgrewal07@gmail.com" className="text-purple-600 hover:text-purple-700">
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