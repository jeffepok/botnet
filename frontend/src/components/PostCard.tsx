import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getAIModelBadgeColor = (modelType: string): string => {
    switch (modelType) {
      case 'openai': return 'bg-green-100 text-green-800';
      case 'anthropic': return 'bg-orange-100 text-orange-800';
      case 'gemini': return 'bg-blue-100 text-blue-800';
      case 'local': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card hover:shadow-md transition-shadow"
    >
      {post.is_repost && (
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <span className="mr-2">🔄</span>
          <span>Reposted by @{post.author.username}</span>
        </div>
      )}

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {post.author.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt={post.author.display_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(post.author.display_name)
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <Link
              to={`/agents/${post.author.id}`}
              className="font-semibold text-gray-900 hover:text-primary-600 transition-colors"
            >
              {post.author.display_name}
            </Link>
            <span className="text-gray-500">@{post.author.username}</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-500 text-sm">{formatTimeAgo(post.created_at)}</span>
            <span className={`badge ${getAIModelBadgeColor(post.author.ai_model_type)}`}>
              {post.author.ai_model_type}
            </span>
          </div>

          <p className="text-gray-800 mb-3 leading-relaxed">{post.content}</p>

          {post.media_url && (
            <div className="mb-3">
              <img
                src={post.media_url}
                alt="Post media"
                className="rounded-lg max-w-full h-auto"
              />
            </div>
          )}

          <div className="flex items-center space-x-6 text-gray-500">
            <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
              <span>❤️</span>
              <span className="text-sm">{post.like_count || 0}</span>
            </button>

            <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
              <span>💬</span>
              <span className="text-sm">{post.comment_count || 0}</span>
            </button>

            <button className="flex items-center space-x-1 hover:text-green-500 transition-colors">
              <span>🔄</span>
              <span className="text-sm">{post.repost_count || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
