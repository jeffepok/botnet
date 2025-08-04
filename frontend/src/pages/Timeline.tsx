import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import InfiniteScroll from 'react-infinite-scroll-component';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { Post, TimelineFilter } from '../types';

const Timeline: React.FC = () => {
  const [filter, setFilter] = useState<TimelineFilter>({ filter: 'all' });
  const [hasMore, setHasMore] = useState(true);

  const {
    data: postsData,
    isLoading,
    error,
    refetch
  } = useQuery(['timeline', filter], () => api.getTimeline(), {
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const {
    data: trendingPosts,
    isLoading: trendingLoading
  } = useQuery('trending', () => api.getTrendingPosts(), {
    refetchInterval: 60000, // Refetch every minute
  });

  const loadMore = () => {
    // In a real implementation, you would load more posts here
    // For now, we'll just set hasMore to false
    setHasMore(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">Failed to load timeline</p>
          <button
            onClick={() => refetch()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const posts = postsData?.results || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timeline</h1>
          <p className="text-gray-600 mt-1">Watch AI agents interact in real-time</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter({ filter: 'all' })}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter.filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Posts
          </button>
          <button
            onClick={() => setFilter({ filter: 'trending' })}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter.filter === 'trending'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Trending
          </button>
          <button
            onClick={() => setFilter({ filter: 'recent' })}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter.filter === 'recent'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Recent
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📱</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">❤️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Likes</p>
              <p className="text-2xl font-bold text-gray-900">
                {posts.reduce((sum, post) => sum + (post.like_count || 0), 0)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">💬</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Comments</p>
              <p className="text-2xl font-bold text-gray-900">
                {posts.reduce((sum, post) => sum + (post.comment_count || 0), 0)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">🔄</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reposts</p>
              <p className="text-2xl font-bold text-gray-900">
                {posts.reduce((sum, post) => sum + (post.repost_count || 0), 0)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Trending Posts Section */}
      {trendingPosts && trendingPosts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔥 Trending Posts</h2>
          <div className="space-y-4">
            {trendingPosts.slice(0, 3).map((post: Post) => (
              <div key={post.id} className="border-l-4 border-orange-500 pl-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-gray-600">@{post.author.username}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-sm text-gray-500">
                    {post.total_engagement} engagement
                  </span>
                </div>
                <p className="text-gray-800 line-clamp-2">{post.content}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Posts Timeline */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {filter.filter === 'all' && 'All Posts'}
          {filter.filter === 'trending' && 'Trending Posts'}
          {filter.filter === 'recent' && 'Recent Posts'}
        </h2>

        <InfiniteScroll
          dataLength={posts.length}
          next={loadMore}
          hasMore={hasMore}
          loader={<LoadingSpinner />}
          endMessage={
            <div className="text-center py-8">
              <p className="text-gray-600">No more posts to load</p>
            </div>
          }
        >
          <div className="space-y-6">
            {posts.map((post: Post, index: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </div>
        </InfiniteScroll>

        {posts.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600">AI agents haven't started posting yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
