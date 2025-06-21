import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter,
  Pin, 
  Heart, 
  Reply, 
  MoreVertical,
  MessageSquare,
  FileText,
  Image,
  Archive,
} from 'lucide-react';
import type { TeamDiscussion } from '../types/teamDashboard';

interface DiscussionListProps {
  discussions: TeamDiscussion[];
  onLike: (discussionId: string) => void;
  onReply: (discussionId: string, content: string) => void;
  onCreateDiscussion: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedHashtag: string;
  setSelectedHashtag: (hashtag: string) => void;
}

export const DiscussionList: React.FC<DiscussionListProps> = ({
  discussions,
  onLike,
  onReply,
  onCreateDiscussion,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedHashtag,
  setSelectedHashtag
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories', color: 'bg-gray-100 text-gray-800' },
    { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-800' },
    { value: 'frontend', label: 'Frontend', color: 'bg-blue-100 text-blue-800' },
    { value: 'backend', label: 'Backend', color: 'bg-green-100 text-green-800' },
    { value: 'design', label: 'Design', color: 'bg-purple-100 text-purple-800' },
    { value: 'bug', label: 'Bug', color: 'bg-red-100 text-red-800' },
    { value: 'feature', label: 'Feature', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'question', label: 'Question', color: 'bg-indigo-100 text-indigo-800' }
  ];

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.color : 'bg-gray-200 text-gray-800';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="w-4 h-4" />;
    return <Archive className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleReply = async (discussionId: string) => {
    if (!replyContent.trim()) return;

    setSubmittingReply(true);
    try {
      await onReply(discussionId, replyContent);
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setSubmittingReply(false);
    }
  };

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.hashtags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || discussion.category === selectedCategory;
    const matchesHashtag = !selectedHashtag || discussion.hashtags.includes(selectedHashtag);
    
    return matchesSearch && matchesCategory && matchesHashtag;
  });

  // Extract unique hashtags from discussions
  const allHashtags = Array.from(new Set(discussions.flatMap(d => d.hashtags)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Discussions</h2>
        <button
          onClick={onCreateDiscussion}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Discussion</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="space-y-4">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category.value
                          ? category.color
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hashtags */}
              {allHashtags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Hashtags</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedHashtag('')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        !selectedHashtag
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    {allHashtags.map((hashtag) => (
                      <button
                        key={hashtag}
                        onClick={() => setSelectedHashtag(hashtag)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedHashtag === hashtag
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        #{hashtag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        {filteredDiscussions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory !== 'all' || selectedHashtag
                ? 'Try adjusting your search or filters'
                : 'Start the first discussion to get the conversation going!'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && !selectedHashtag && (
              <button
                onClick={onCreateDiscussion}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Discussion
              </button>
            )}
          </div>
        ) : (
          filteredDiscussions.map((discussion) => (
            <motion.div
              key={discussion._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border overflow-hidden"
            >
              {/* Discussion Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                        {discussion.author.profilePicture ? (
                          <img 
                            src={discussion.author.profilePicture} 
                            alt={discussion.author.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {discussion.author.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{discussion.title}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>by {discussion.author.name}</span>
                          <span>•</span>
                          <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                          {discussion.isPinned && (
                            <>
                              <span>•</span>
                              <Pin className="w-3 h-3 text-yellow-500" />
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Category and Hashtags */}
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(discussion.category)}`}>
                        {discussion.category}
                      </span>
                      {discussion.hashtags.map((hashtag, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          #{hashtag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Discussion Content */}
              <div className="p-6">
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{discussion.content}</p>

                {/* Attachments */}
                {discussion.attachments && discussion.attachments.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments</h4>
                    <div className="space-y-2">
                      {discussion.attachments.map((file, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          {getFileIcon(file.fileType)}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
                          </div>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700 text-sm"
                          >
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => onLike(discussion._id)}
                      className={`flex items-center space-x-1 text-sm transition-colors ${
                        discussion.likes.includes(localStorage.getItem('userId') || '')
                          ? 'text-red-600'
                          : 'text-gray-500 hover:text-red-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${discussion.likes.includes(localStorage.getItem('userId') || '') ? 'fill-current' : ''}`} />
                      <span>{discussion.likes.length}</span>
                    </button>
                    <button
                      onClick={() => setReplyingTo(replyingTo === discussion._id ? null : discussion._id)}
                      className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                    >
                      <Reply className="w-4 h-4" />
                      <span>{discussion.replies.length}</span>
                    </button>
                  </div>
                </div>

                {/* Reply Form */}
                <AnimatePresence>
                  {replyingTo === discussion._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="flex space-x-3">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write a reply..."
                          rows={3}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                        />
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => handleReply(discussion._id)}
                            disabled={submittingReply || !replyContent.trim()}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submittingReply ? 'Sending...' : 'Reply'}
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent('');
                            }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Replies */}
                {discussion.replies.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Replies ({discussion.replies.length})</h4>
                    <div className="space-y-4">
                      {discussion.replies.map((reply) => (
                        <div key={reply._id} className="flex space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            {reply.author.profilePicture ? (
                              <img 
                                src={reply.author.profilePicture} 
                                alt={reply.author.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span className="text-white font-bold text-xs">
                                {reply.author.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">{reply.author.name}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}; 