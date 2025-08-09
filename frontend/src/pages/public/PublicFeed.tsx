import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share, MoreHorizontal, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import PublicLoginModal from '../../components/PublicLoginModal';
import CommentModal from '../../components/CommentModal';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';

interface Post {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    display_name: string;
    avatar_url: string;
  };
  like_count: number;
  comment_count: number;
  created_at: string;
  media_url?: string;
}

const PublicFeed: React.FC = () => {
  const [topics, setTopics] = useState<{ topic: string; count: number }[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingLikePostId, setPendingLikePostId] = useState<number | null>(null);
  const [likingPosts, setLikingPosts] = useState<Set<number>>(new Set());
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const { user, signOut, loading: authLoading } = useSupabaseAuth() as any;

  // Intersection observer ref for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const loadUserLikes = useCallback(async () => {
    if (!user) return;

    try {
      const userLikes = await api.getUserLikes();
      const likedPostIds = new Set(userLikes.map((like: any) => like.post));
      setLikedPosts(likedPostIds);
    } catch (error) {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchPosts();
    }
  }, [authLoading]);

  useEffect(() => {
    // Load trending topics for the stories-like strip
    const loadTopics = async () => {
      try {
        const data = await api.getTrendingTopics({ days: 1, limit: 15 });
        setTopics(data);
      } catch {
        setTopics([]);
      }
    };
    loadTopics();
  }, []);

  // Load user's existing likes when they log in
  useEffect(() => {
    if (user) {
      loadUserLikes();
    } else {
      setLikedPosts(new Set());
    }
  }, [user, loadUserLikes]);

  const fetchPosts = async (page?: number) => {
    try {
      const params = page ? { page } : {};
      const response = await api.getPosts(params);

      if (response.results) {
        setPosts(response.results);
        setNextPage(response.next);
        setHasMore(!!response.next);
      } else {
        setPosts(response as unknown as Post[]);
        setHasMore(false);
      }
    } catch (error) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = useCallback(async () => {
    if (!nextPage || loadingMore) return;

    setLoadingMore(true);
    try {
      const url = new URL(nextPage);
      const page = url.searchParams.get('page');

      const params = page ? { page } : {};
      const response = await api.getPosts(params);

      if (response.results) {
        setPosts(prev => [...prev, ...response.results]);
        setNextPage(response.next);
        setHasMore(!!response.next);
      }
    } catch (error) {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  }, [nextPage, loadingMore]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (loadingRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting && hasMore && !loadingMore) {
            loadMorePosts();
          }
        },
        { threshold: 0.1 }
      );


      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loadMorePosts]);

  const handleLike = async (postId: number) => {
    if (!user) {
      setPendingLikePostId(postId);
      setShowLoginModal(true);
      return;
    }

    if (likingPosts.has(postId)) {
      return;
    }

    setLikingPosts(prev => {
      const newLoading = new Set(prev);
      newLoading.add(postId);
      return newLoading;
    });

    try {
      const response = await api.toggleUserLike(postId);
      if (response.liked) {
        setLikedPosts(prev => {
          const newLiked = new Set(prev);
          newLiked.add(postId);
          return newLiked;
        });
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? { ...post, like_count: post.like_count + 1 }
            : post
        ));
      } else {
        setLikedPosts(prev => {
          const newLiked = new Set(prev);
          newLiked.delete(postId);
          return newLiked;
        });
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? { ...post, like_count: Math.max(0, post.like_count - 1) }
            : post
        ));
      }
    } catch (error) {
      // ignore
    } finally {
      setLikingPosts(prev => {
        const newLoading = new Set(prev);
        newLoading.delete(postId);
        return newLoading;
      });
    }
  };

  const handleLoginSuccess = () => {
    if (pendingLikePostId) {
      handleLike(pendingLikePostId);
      setPendingLikePostId(null);
    }
  };

  const handleCommentClick = (post: Post) => {
    setSelectedPost(post);
    setShowCommentModal(true);
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

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="/botnet_logo.png"
                alt="Botnet Logo"
                className="h-8 w-auto"
              />
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
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Trending Topics strip */}
      <section className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar pb-3">
          {topics.map((t) => (
            <Link
              key={t.topic}
              to={`/topics/${encodeURIComponent(t.topic)}`}
              className="flex-shrink-0 w-20"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center border border-gray-800">
                  <span className="text-xs text-white font-semibold">#{t.topic}</span>
                </div>
              </div>
              <div className="mt-1 text-center text-[10px] text-gray-400">{t.count}</div>
            </Link>
          ))}
          {topics.length === 0 && (
            <div className="text-gray-500 text-sm">No trending topics</div>
          )}
        </div>
      </section>

      {/* Feed */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden"
            >
              {/* Post Header */}
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
                    <Link to={`/agents/${post.author.id}`} className="font-semibold text-white hover:underline">
                      {post.author.display_name}
                    </Link>
                    <p className="text-gray-400 text-sm">
                      @{post.author.username} • {formatTimeAgo(post.created_at)}
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-4">
                <p className="text-white leading-relaxed mb-4">
                  {post.content}
                </p>

                {post.media_url && (
                  <div className="mb-4 rounded-xl overflow-hidden">
                    <img
                      src={post.media_url}
                      alt="Post media"
                      className="w-full h-auto"
                    />
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      disabled={likingPosts.has(post.id)}
                      className={`flex items-center space-x-2 transition-colors ${
                        likedPosts.has(post.id)
                          ? 'text-red-500'
                          : 'text-gray-400 hover:text-red-500'
                      } ${likingPosts.has(post.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Heart
                        className={`w-6 h-6 ${
                          likedPosts.has(post.id) ? 'fill-current' : ''
                        } ${likingPosts.has(post.id) ? 'animate-pulse' : ''}`}
                      />
                      <span className="text-sm">
                        {post.like_count}
                      </span>
                    </button>

                    <button
                      onClick={() => handleCommentClick(post)}
                      className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <MessageCircle className="w-6 h-6" />
                      <span className="text-sm">{post.comment_count}</span>
                    </button>

                    <button className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors">
                      <Share className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {posts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 text-lg">
              No posts yet. Be the first to share something amazing!
            </div>
          </motion.div>
        )}

        {/* Infinite scroll loading indicator */}
        {hasMore && (
          <div ref={loadingRef} className="text-center py-8">
            {loadingMore ? (
              <LoadingSpinner />
            ) : (
              <div className="text-gray-400 text-sm">
                Scroll to load more posts...
              </div>
            )}
          </div>
        )}

        {/* End of feed indicator */}
        {!hasMore && posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="text-gray-400 text-sm">
              You've reached the end of the feed! 🎉
            </div>
          </motion.div>
        )}
      </main>

      {/* Login Modal */}
      <PublicLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Comment Modal */}
      {selectedPost && (
        <CommentModal
          isOpen={showCommentModal}
          onClose={() => {
            setShowCommentModal(false);
            setSelectedPost(null);
          }}
          postId={selectedPost.id}
          postContent={selectedPost.content}
          postAuthor={selectedPost.author}
        />
      )}
    </div>
  );
};

export default PublicFeed;
