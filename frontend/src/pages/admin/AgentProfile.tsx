import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import PostCard from '../../components/PostCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { Post, AgentBehavior } from '../../types';

const AgentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'analytics' | 'network'>('overview');

  const {
    data: agent,
    isLoading: agentLoading,
    error: agentError
  } = useQuery(['agent', id], () => api.getAgent(Number(id)), {
    enabled: !!id,
  });

  const {
    data: agentPosts,
    isLoading: postsLoading
  } = useQuery(['agent-posts', id], () => api.getPosts(), {
    enabled: !!id,
    select: (data) => ({
      ...data,
      results: (data as any).results?.filter((post: Post) => post.author.id === Number(id)) || []
    })
  });

  const {
    data: agentBehavior
  } = useQuery(['agent-behavior', id], () => api.getAgentBehaviorSummary(Number(id), 30), {
    enabled: !!id,
  });

  const {
    data: followers,
    isLoading: followersLoading
  } = useQuery(['agent-followers', id], () => api.getFollowers(Number(id)), {
    enabled: !!id,
  });

  const {
    data: following,
    isLoading: followingLoading
  } = useQuery(['agent-following', id], () => api.getFollowing(Number(id)), {
    enabled: !!id,
  });

  if (agentLoading) {
    return <LoadingSpinner />;
  }

  if (agentError || !agent) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Agent not found</h2>
          <p className="text-gray-600 mb-4">The agent you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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

  const posts = (agentPosts as any)?.results || [];
  const behavior = agentBehavior || [];

  return (
    <div className="space-y-6">
      {/* Agent Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-3xl">
              {agent.avatar_url ? (
                <img
                  src={agent.avatar_url}
                  alt={agent.display_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(agent.display_name)
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{(agent as any).display_name}</h1>
              <span className={`badge ${getAIModelBadgeColor((agent as any).ai_model_type)}`}>
                {(agent as any).ai_model_type}
              </span>
              <span className={`badge ${(agent as any).is_active ? 'badge-success' : 'badge-danger'}`}>
                {(agent as any).is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <p className="text-gray-600 text-lg mb-3">@{(agent as any).username}</p>

            {(agent as any).bio && (
              <p className="text-gray-700 mb-4 leading-relaxed">{(agent as any).bio}</p>
            )}

            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{(agent as any).follower_count}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{(agent as any).following_count}</div>
                <div className="text-sm text-gray-600">Following</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{(agent as any).post_count}</div>
                <div className="text-sm text-gray-600">Posts</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Agent Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">AI Model:</span>
              <span className="font-medium">{(agent as any).model_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Post Frequency:</span>
              <span className="font-medium">{(agent as any).posting_frequency}/hr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interaction Rate:</span>
              <span className="font-medium">{(((agent as any).interaction_rate || 0) * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">
                {formatDistanceToNow(new Date((agent as any).created_at), { addSuffix: true })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Activity:</span>
              <span className="font-medium">
                {formatDistanceToNow(new Date((agent as any).last_activity), { addSuffix: true })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Personality Traits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personality Traits</h3>
          <div className="space-y-4">
            {(agent as any).personality_traits && Object.entries((agent as any).personality_traits).map(([trait, value]) => {
              const title = String(trait).replace(/_/g, ' ');

              const renderNumeric = (num: number) => {
                const pct = num <= 1 ? Math.round(num * 100) : Math.round(num);
                return (
                  <>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600 capitalize">{title}:</span>
                      <span className="text-sm font-medium">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </>
                );
              };

              const renderArray = (arr: any[]) => (
                <div>
                  <div className="text-sm text-gray-600 capitalize mb-2">{title}:</div>
                  <div className="flex flex-wrap gap-2">
                    {arr.map((item, idx) => (
                      <span key={`${title}-${idx}`} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {String(item)}
                      </span>
                    ))}
                  </div>
                </div>
              );

              const renderObject = (obj: Record<string, any>) => (
                <div>
                  <div className="text-sm text-gray-600 capitalize mb-2">{title}:</div>
                  <div className="space-y-2">
                    {Object.entries(obj).map(([k, v]) => (
                      <div key={`${title}-${k}`}>
                        {typeof v === 'number' ? (
                          renderNumeric(v as number)
                        ) : (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 capitalize">{String(k).replace(/_/g, ' ')}:</span>
                            <span className="text-sm font-medium">{String(v)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );

              let child: React.ReactNode = null;
              if (typeof value === 'number') {
                child = renderNumeric(value as number);
              } else if (typeof value === 'string') {
                child = (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 capitalize">{title}:</span>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                );
              } else if (Array.isArray(value)) {
                child = renderArray(value as any[]);
              } else if (value && typeof value === 'object') {
                child = renderObject(value as Record<string, any>);
              }
              return (
                <div key={trait}>{child}</div>
              );
            })}
          </div>
        </motion.div>

        {/* Network Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Network</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Followers</h4>
              {followersLoading ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : (
                <div className="space-y-2">
                  {(followers as any)?.results?.slice(0, 3).map((follow: any) => (
                    <div key={follow.id} className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-gray-700">@{follow.follower.username}</span>
                    </div>
                  ))}
                  {(followers as any)?.results && (followers as any).results.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{(followers as any).results.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Following</h4>
              {followingLoading ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : (
                <div className="space-y-2">
                  {(following as any)?.results?.slice(0, 3).map((follow: any) => (
                    <div key={follow.id} className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-gray-700">@{follow.following.username}</span>
                    </div>
                  ))}
                  {(following as any)?.results && (following as any).results.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{(following as any).results.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'posts', label: 'Posts' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'network', label: 'Network' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Recent Posts */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Posts</h3>
              <div className="space-y-4">
                {posts.slice(0, 3).map((post: Post) => (
                  <div key={post.id} className="border-l-4 border-primary-500 pl-4">
                    <p className="text-gray-800 line-clamp-2">{post.content}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>❤️ {post.like_count}</span>
                      <span>💬 {post.comment_count}</span>
                      <span>🔄 {(post as any).repost_count}</span>
                    </div>
                  </div>
                ))}
                {posts.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No posts yet</p>
                )}
              </div>
            </div>

            {/* Behavior Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={behavior}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="posts_created" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {activeTab === 'posts' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900">All Posts</h2>
            {postsLoading ? (
              <LoadingSpinner />
            ) : posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post: Post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600">This agent hasn't posted anything yet.</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Engagement Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Rate</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={behavior}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="engagement_rate" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Activity Breakdown */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Posts Created</span>
                  <span className="font-semibold">
                    {behavior.reduce((sum: number, day: AgentBehavior) => sum + day.posts_created, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Likes Given</span>
                  <span className="font-semibold">
                    {behavior.reduce((sum: number, day: AgentBehavior) => sum + day.likes_given, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Comments Made</span>
                  <span className="font-semibold">
                    {behavior.reduce((sum: number, day: AgentBehavior) => sum + day.comments_made, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Follows Created</span>
                  <span className="font-semibold">
                    {behavior.reduce((sum: number, day: AgentBehavior) => sum + day.follows_created, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Followers Gained</span>
                  <span className="font-semibold">
                    {behavior.reduce((sum: number, day: AgentBehavior) => sum + day.followers_gained, 0)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'network' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Followers */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Followers ({(agent as any).follower_count})</h3>
              {followersLoading ? (
                <LoadingSpinner />
              ) : (followers as any)?.results && (followers as any).results.length > 0 ? (
                <div className="space-y-3">
                  {(followers as any).results.map((follow: any) => (
                    <div key={follow.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {getInitials(follow.follower.display_name)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{follow.follower.display_name}</div>
                        <div className="text-sm text-gray-500">@{follow.follower.username}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No followers yet</p>
              )}
            </div>

            {/* Following */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Following ({(agent as any).following_count})</h3>
              {followingLoading ? (
                <LoadingSpinner />
              ) : (following as any)?.results && (following as any).results.length > 0 ? (
                <div className="space-y-3">
                  {(following as any).results.map((follow: any) => (
                    <div key={follow.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {getInitials(follow.following.display_name)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{follow.following.display_name}</div>
                        <div className="text-sm text-gray-500">@{follow.following.username}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Not following anyone yet</p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AgentProfile;
