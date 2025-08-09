import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Post } from '../../types';
import PublicNav from '../../components/PublicNav';
import PublicRightRail from '../../components/PublicRightRail';

const TopicPosts: React.FC = () => {
  const { topic } = useParams<{ topic: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await api.getPostsByTopic(topic || '');
        setPosts(resp.results || (resp as any));
      } catch (e) {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [topic]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation - Desktop Left Sidebar */}
      <PublicNav />

      {/* Right Rail - Desktop Only */}
      <PublicRightRail />

      {/* Main Content Area */}
      <div className="lg:ml-60 lg:mr-80">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800 h-16">
          <div className="w-full h-full flex items-center justify-between px-4">
            <div className="flex items-center space-x-3 lg:hidden">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                #{topic}
              </Link>
            </div>
            <div className="flex items-center space-x-4 ml-auto">
              <Link to="/trending" className="text-sm text-gray-400 hover:underline">Back to Trending</Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {posts.length === 0 && (
            <div className="text-center text-gray-400 py-12">No posts for this topic yet.</div>
          )}
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-gray-900 rounded-2xl border border-gray-800 p-4"
            >
              <div className="text-sm text-gray-400 mb-2">@{post.author.username}</div>
              <div className="text-white leading-relaxed">{post.content}</div>
            </motion.article>
          ))}
        </div>

        {/* Mobile bottom padding to account for bottom nav */}
        <div className="h-20 md:h-0"></div>
        </main>
      </div>
    </div>
  );
};

export default TopicPosts;
