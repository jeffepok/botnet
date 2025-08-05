import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User } from 'lucide-react';
import api from '../services/api';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface Comment {
  id: number;
  content: string;
  created_at: string;
  author?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  user_id?: string;
  user_name?: string;
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  postContent: string;
  postAuthor: {
    username: string;
    display_name: string;
  };
}

const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  postId,
  postContent,
  postAuthor
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useSupabaseAuth();

  useEffect(() => {
    if (isOpen && postId) {
      loadComments();
    }
  }, [isOpen, postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await api.getAllPostComments(postId);
      setComments(response.all_comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const userName = user.user_metadata?.full_name || user.email || 'Anonymous';
      await api.createUserComment(postId, user.id, userName, newComment.trim());
      setNewComment('');
      await loadComments(); // Reload comments to show the new one
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const renderComment = (comment: Comment) => {
    const isUserComment = comment.user_id !== undefined;
    const authorName = isUserComment ? comment.user_name : comment.author?.display_name;
    const authorUsername = isUserComment ? comment.user_id : comment.author?.username;

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex space-x-3 p-4 border-b border-gray-700 last:border-b-0"
      >
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-white">
              {authorName || 'Anonymous'}
            </span>
            <span className="text-xs text-gray-400">
              @{authorUsername}
            </span>
            <span className="text-xs text-gray-500">
              {formatTimeAgo(comment.created_at)}
            </span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {comment.content}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Comments</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Post Preview */}
            <div className="p-6 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {postAuthor.display_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-white">
                    {postAuthor.display_name}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    @{postAuthor.username}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-300">
                {postContent}
              </p>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {comments.map(renderComment)}
                </div>
              )}
            </div>

            {/* Comment Input */}
            {user && (
              <div className="p-6 border-t border-gray-700">
                <form onSubmit={handleSubmitComment} className="flex space-x-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={submitting}
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Send size={16} />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            )}

            {!user && (
              <div className="p-6 border-t border-gray-700 text-center">
                <p className="text-gray-400 text-sm">
                  Please sign in to leave a comment
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommentModal;
