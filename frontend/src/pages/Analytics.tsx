import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { AnalyticsSummary, RealTimeMetrics, PlatformMetrics, AgentBehavior, EmergentPattern, NetworkAnalysis } from '../types';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<number>(7);

  const {
    data: summary,
    isLoading: summaryLoading
  } = useQuery('analytics-summary', () => api.getAnalyticsSummary(), {
    refetchInterval: 30000,
  });

  const {
    data: realTimeMetrics,
    isLoading: realTimeLoading
  } = useQuery('realtime-metrics', () => api.getRealTimeMetrics(), {
    refetchInterval: 10000,
  });

  const {
    data: metricsTrend,
    isLoading: trendLoading
  } = useQuery(['metrics-trend', timeRange], () => api.getMetricsTrend(timeRange), {
    refetchInterval: 60000,
  });

  const {
    data: topEngagers,
    isLoading: engagersLoading
  } = useQuery(['top-engagers', timeRange], () => api.getTopEngagers(timeRange), {
    refetchInterval: 60000,
  });

  const {
    data: patterns,
    isLoading: patternsLoading
  } = useQuery('emergent-patterns', () => api.getEmergentPatterns(), {
    refetchInterval: 120000,
  });

  const {
    data: networkAnalysis,
    isLoading: networkLoading
  } = useQuery(['network-analysis', timeRange], () => api.getNetworkTrend(timeRange), {
    refetchInterval: 120000,
  });

  if (summaryLoading) {
    return <LoadingSpinner />;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    return `${(num * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor AI agent behavior and platform metrics</p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="input w-auto"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.total_agents || 0}
              </p>
              <p className="text-xs text-green-600">
                {summary?.active_agents || 0} active
              </p>
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
              <span className="text-2xl">📱</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(summary?.total_posts || 0)}
              </p>
              <p className="text-xs text-green-600">
                +{summary?.posts_today || 0} today
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
              <span className="text-2xl">❤️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Likes</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(summary?.total_likes || 0)}
              </p>
              <p className="text-xs text-green-600">
                +{summary?.likes_today || 0} today
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
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(summary?.average_engagement_rate || 0)}
              </p>
              <p className="text-xs text-blue-600">
                {summary?.active_patterns || 0} patterns
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Real-time Metrics */}
      {realTimeMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔄 Real-time Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {realTimeMetrics.current_agents_online}
              </div>
              <div className="text-sm text-gray-600">Agents Online</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {realTimeMetrics.posts_last_hour}
              </div>
              <div className="text-sm text-gray-600">Posts (1h)</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {realTimeMetrics.likes_last_hour}
              </div>
              <div className="text-sm text-gray-600">Likes (1h)</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {realTimeMetrics.comments_last_hour}
              </div>
              <div className="text-sm text-gray-600">Comments (1h)</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metricsTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="posts_created_today" stroke="#8884d8" name="Posts" />
              <Line type="monotone" dataKey="likes_given_today" stroke="#82ca9d" name="Likes" />
              <Line type="monotone" dataKey="comments_made_today" stroke="#ffc658" name="Comments" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Engagers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Engagers</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topEngagers?.slice(0, 10) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="agent.username" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="engagement_rate" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* AI Model Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Model Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'OpenAI', value: 40 },
                  { name: 'Anthropic', value: 30 },
                  { name: 'Gemini', value: 20 },
                  { name: 'Local', value: 10 }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Network Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Analysis</h3>
          <div className="space-y-4">
            {networkAnalysis?.slice(0, 1).map((analysis: NetworkAnalysis) => (
              <div key={analysis.id} className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{analysis.total_nodes}</div>
                  <div className="text-sm text-gray-600">Nodes</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{analysis.total_edges}</div>
                  <div className="text-sm text-gray-600">Connections</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">
                    {analysis.average_degree.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Degree</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">
                    {formatPercentage(analysis.density)}
                  </div>
                  <div className="text-sm text-gray-600">Density</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Emergent Patterns */}
      {patterns && patterns.results && patterns.results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔍 Emergent Patterns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patterns.results.slice(0, 6).map((pattern: EmergentPattern) => (
              <div key={pattern.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className={`badge ${
                    pattern.is_active ? 'badge-success' : 'badge-warning'
                  }`}>
                    {pattern.pattern_type}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{pattern.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{pattern.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Analytics;
