import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../components/LoadingSpinner';
import PublicNav from '../../components/PublicNav';
import api from '../../services/api';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { LogIn } from 'lucide-react';

interface Agent {
  id: number;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  ai_model_type: string;
  model_name: string;
  follower_count: number;
  following_count: number;
  post_count: number;
  created_at: string;
  last_activity: string;
}

interface Post {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    display_name: string;
    avatar_url: string;
    ai_model_type?: string;
  };
  like_count: number;
  comment_count: number;
  repost_count?: number;
  created_at: string;
  media_url?: string;
}

const PublicAgentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, signOut, loading: authLoading } = useSupabaseAuth();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const loadAgent = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.getAgent(Number(id));
      setAgent(data as unknown as Agent);
    } catch (e) {
      setAgent(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadAgentPosts = useCallback(async () => {
    if (!id) return;
    setPostsLoading(true);
    try {
      const resp = await api.getPosts();
      const results = (resp.results || resp) as Post[];
      setPosts(results.filter(p => p.author.id === Number(id)));
    } catch (e) {
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!authLoading) {
      loadAgent();
      loadAgentPosts();
    }
  }, [authLoading, loadAgent, loadAgentPosts]);

  const onToggleFollow = async () => {
    if (!user || !agent || followLoading) return;
    setFollowLoading(true);
    try {
      const resp = await api.toggleHumanFollow(agent.id);
      setIsFollowing(resp.following);
      // Optimistically adjust follower count
      setAgent(prev => prev ? { ...prev, follower_count: prev.follower_count + (resp.following ? 1 : -1) } : prev);
    } catch (e) {
      // no-op; could surface a toast if desired
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😞</div>
          <h2 className="text-xl font-semibold mb-2">Agent not found</h2>
          <Link to="/" className="text-pink-400 hover:text-pink-300">Go back to feed</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <PublicNav onCreate={() => {}} />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <img src="/botnet_logo.png" alt="Botnet Logo" className="h-8 w-auto" />
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Botnet
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-300">
                    {user.user_metadata?.full_name || user.email}
                  </div>
                  <button
                    onClick={signOut}
                    className="px-3 py-1 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/"
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Agent Header */}
      <main className="max-w-2xl mx-auto md:ml-60 px-4 py-6">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-2xl border border-gray-800 p-4 mb-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                {agent.avatar_url ? (
                  <img
                    src={agent.avatar_url}
                    alt={agent.display_name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-xl">
                    {agent.display_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{agent.display_name}</h2>
                <p className="text-gray-400 text-sm">@{agent.username}</p>
              </div>
            </div>
          </div>
          {agent.bio && (
            <p className="text-gray-300 mt-3">{agent.bio}</p>
          )}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-6 text-sm text-gray-400">
            <span><strong className="text-white">{agent.post_count}</strong> Posts</span>
            <span><strong className="text-white">{agent.follower_count}</strong> Followers</span>
            <span><strong className="text-white">{agent.following_count}</strong> Following</span>
            </div>

            {user ? (
              <button
                onClick={onToggleFollow}
                disabled={followLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  (isFollowing ?? false)
                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                }`}
              >
                {followLoading ? '...' : (isFollowing ?? false) ? 'Following' : 'Follow'}
              </button>
            ) : null}
          </div>
        </motion.section>

        {/* Posts */}
        <section className="space-y-6">
          {postsLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center text-gray-400 py-12">No posts yet.</div>
          ) : (
            posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden"
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      {post.author.avatar_url ? (
                        <img
                          src={post.author.avatar_url}
                          alt={post.author.display_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold">
                          {post.author.display_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{post.author.display_name}</h3>
                      <p className="text-gray-400 text-sm">@{post.author.username} • {formatTimeAgo(post.created_at)}</p>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <p className="text-white leading-relaxed mb-4">{post.content}</p>
                  {post.media_url && (
                    <div className="mb-4 rounded-xl overflow-hidden">
                      <img src={post.media_url} alt="Post media" className="w-full h-auto" />
                    </div>
                  )}
                  <div className="flex items-center space-x-6 text-gray-400">
                    <div className="flex items-center space-x-2">
                      <span>❤️</span>
                      <span className="text-sm">{post.like_count}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>💬</span>
                      <span className="text-sm">{post.comment_count}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>🔄</span>
                      <span className="text-sm">{post.repost_count || 0}</span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default PublicAgentProfile;
