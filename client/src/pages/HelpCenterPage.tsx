import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../Contexts/ThemeContext';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  BookOpen,
  Users,
  Shield,
  Settings,
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    question: "How do I create an account?",
    answer: "To create an account, click on the 'Sign Up' button in the top right corner. You can sign up using your email address or through GitHub. Follow the registration process and verify your email to get started.",
    category: "Account"
  },
  {
    question: "How do I connect with other developers?",
    answer: "You can connect with other developers in several ways: 1) Use the Search page to find developers based on skills and interests, 2) Visit the Matches page to see recommended connections, 3) Send connection requests to developers you'd like to connect with.",
    category: "Connections"
  },
  {
    question: "How do I update my profile?",
    answer: "To update your profile, go to your profile page and click the 'Edit Profile' button. You can update your information, add skills, interests, and upload profile/background pictures.",
    category: "Profile"
  },
  {
    question: "How do I manage my privacy settings?",
    answer: "You can manage your privacy settings in your profile settings. You can control who can see your profile, contact you, and view your activity status.",
    category: "Privacy"
  },
  {
    question: "What should I do if I receive inappropriate messages?",
    answer: "If you receive inappropriate messages, you can block the user and report them using the report button. Our team will review the report and take appropriate action.",
    category: "Safety"
  },
  {
    question: "How do I delete my account?",
    answer: "To delete your account, go to your profile settings and scroll to the bottom. Click on 'Delete Account' and follow the confirmation process. Please note that this action is irreversible.",
    category: "Account"
  }
];

const helpTopics = [
  {
    title: "Getting Started",
    icon: <BookOpen className="w-6 h-6" />,
    description: "Learn the basics of using our platform",
    link: "#getting-started"
  },
  {
    title: "Connections",
    icon: <Users className="w-6 h-6" />,
    description: "How to connect with other developers",
    link: "#connections"
  },
  {
    title: "Profile Settings",
    icon: <Settings className="w-6 h-6" />,
    description: "Manage your profile and preferences",
    link: "#profile-settings"
  },
  {
    title: "Privacy & Safety",
    icon: <Shield className="w-6 h-6" />,
    description: "Learn about privacy features and safety",
    link: "#privacy-safety"
  }
];

export const HelpCenterPage: React.FC = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <HelpCircle className="w-8 h-8 text-purple-600" />
            <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Help Center</h1>
          </div>
          <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
            Find answers to common questions and learn how to use our platform
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className={`${theme === 'dark' ? 'text-gray-400' : 'text-white'} absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5`} />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border ${theme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
              />
            </div>
          </div>
        </motion.div>

        {/* Help Topics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {helpTopics.map((topic, index) => (
            <motion.div
              key={topic.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow`}
            >
              <div className={`${theme === 'dark' ? 'text-green-600' : 'text-purple-600'} mb-4`}>{topic.icon}</div>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-2`}>{topic.title}</h3>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm mb-4`}>{topic.description}</p>
              <RouterLink
                to={topic.link}
                className={`${theme === 'dark' ? 'text-green-600 hover:text-green-700' : 'text-purple-600 hover:text-purple-700'} text-sm font-medium flex items-center`}
              >
                Learn more
                <ChevronDown className="w-4 h-4 ml-1" />
              </RouterLink>
            </motion.div>
          ))}
        </div>

        {/* FAQs */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6 mb-12`}>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-6`}>Frequently Asked Questions</h2>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${!selectedCategory
                  ? `${theme === 'dark' ? 'bg-green-600 text-white' : 'bg-purple-600 text-white'}`
                  : `${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${selectedCategory === category
                    ? `${theme === 'dark' ? 'bg-green-600 text-white' : 'bg-purple-600 text-white'}`
                    : `${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.question}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.question ? null : faq.question)}
                  className={`w-full px-6 py-4 text-left flex items-center justify-between ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                >
                  <span className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{faq.question}</span>
                  {expandedFaq === faq.question ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {expandedFaq === faq.question && (
                  <div className={`px-6 py-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-green-600 to-blue-600' : 'bg-gradient-to-r from-purple-600 to-blue-600'} rounded-xl p-8 text-white`}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Still Need Help?</h2>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-100' : 'text-gray-600'} mb-8 opacity-90`}>
              Our support team is here to help you with any questions or issues you may have.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="mailto:ankurgrewal07@gmail.com?subject=Support%20Request&body=Hi%20SkillSync%20team,"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center space-x-2 ${theme === 'dark'
                    ? 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                    : 'bg-white text-purple-600 hover:bg-purple-500 hover:text-white'
                  } px-6 py-3 rounded-lg transition-colors`}
              >
                <Mail className="w-5 h-5" />
                <span>Email Support</span>
              </a>

              {/* <a
                href="#"
                className={`flex items-center justify-center space-x-2 ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-white/10 text-white'} px-6 py-3 rounded-lg hover:bg-white/20 transition-colors`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Live Chat</span>
              </a> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};