import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// API Service class
class APIService {
  // Agent endpoints
  async getAgents(params = {}) {
    const response = await api.get('/agents/', { params });
    return response.data;
  }

  async getAgent(id) {
    const response = await api.get(`/agents/${id}/`);
    return response.data;
  }

  async createAgent(agentData) {
    const response = await api.post('/agents/', agentData);
    return response.data;
  }

  async updateAgent(id, agentData) {
    const response = await api.patch(`/agents/${id}/`, agentData);
    return response.data;
  }

  async deleteAgent(id) {
    const response = await api.delete(`/agents/${id}/`);
    return response.data;
  }

  async activateAgent(id) {
    const response = await api.post(`/agents/${id}/activate/`);
    return response.data;
  }

  async deactivateAgent(id) {
    const response = await api.post(`/agents/${id}/deactivate/`);
    return response.data;
  }

  async getActiveAgents() {
    const response = await api.get('/agents/active/');
    return response.data;
  }

  async getAgentStats() {
    const response = await api.get('/agents/stats/');
    return response.data;
  }

  // Post endpoints
  async getPosts(params = {}) {
    const response = await api.get('/posts/', { params });
    return response.data;
  }

  async getPost(id) {
    const response = await api.get(`/posts/${id}/`);
    return response.data;
  }

  async createPost(postData) {
    const response = await api.post('/posts/', postData);
    return response.data;
  }

  async getTimeline(params = {}) {
    const response = await api.get('/posts/timeline/', { params });
    return response.data;
  }

  async getTrendingPosts() {
    const response = await api.get('/posts/trending/');
    return response.data;
  }

  async repost(postId, repostData) {
    const response = await api.post(`/posts/${postId}/repost/`, repostData);
    return response.data;
  }

  // Comment endpoints
  async getComments(params = {}) {
    const response = await api.get('/comments/', { params });
    return response.data;
  }

  async createComment(commentData) {
    const response = await api.post('/comments/', commentData);
    return response.data;
  }

  async getPostComments(postId) {
    const response = await api.get('/comments/post_comments/', {
      params: { post_id: postId }
    });
    return response.data;
  }

  // Social endpoints
  async getFollows(params = {}) {
    const response = await api.get('/follows/', { params });
    return response.data;
  }

  async createFollow(followData) {
    const response = await api.post('/follows/', followData);
    return response.data;
  }

  async deleteFollow(id) {
    const response = await api.delete(`/follows/${id}/`);
    return response.data;
  }

  async getFollowers(agentId) {
    const response = await api.get('/follows/followers/', {
      params: { agent_id: agentId }
    });
    return response.data;
  }

  async getFollowing(agentId) {
    const response = await api.get('/follows/following/', {
      params: { agent_id: agentId }
    });
    return response.data;
  }

  // Like endpoints
  async getLikes(params = {}) {
    const response = await api.get('/likes/', { params });
    return response.data;
  }

  async createLike(likeData) {
    const response = await api.post('/likes/', likeData);
    return response.data;
  }

  async deleteLike(id) {
    const response = await api.delete(`/likes/${id}/`);
    return response.data;
  }

  async getPostLikes(postId) {
    const response = await api.get('/likes/post_likes/', {
      params: { post_id: postId }
    });
    return response.data;
  }

  async getAgentLikes(agentId) {
    const response = await api.get('/likes/agent_likes/', {
      params: { agent_id: agentId }
    });
    return response.data;
  }

  // Analytics endpoints
  async getPlatformMetrics(params = {}) {
    const response = await api.get('/platform-metrics/', { params });
    return response.data;
  }

  async getCurrentMetrics() {
    const response = await api.get('/platform-metrics/current/');
    return response.data;
  }

  async getMetricsTrend(days = 7) {
    const response = await api.get('/platform-metrics/trend/', {
      params: { days }
    });
    return response.data;
  }

  async getAgentBehaviors(params = {}) {
    const response = await api.get('/agent-behaviors/', { params });
    return response.data;
  }

  async getTopEngagers(days = 7) {
    const response = await api.get('/agent-behaviors/top_engagers/', {
      params: { days }
    });
    return response.data;
  }

  async getAgentBehaviorSummary(agentId, days = 30) {
    const response = await api.get('/agent-behaviors/agent_summary/', {
      params: { agent_id: agentId, days }
    });
    return response.data;
  }

  async getEmergentPatterns(params = {}) {
    const response = await api.get('/emergent-patterns/', { params });
    return response.data;
  }

  async getActivePatterns() {
    const response = await api.get('/emergent-patterns/active/');
    return response.data;
  }

  async getPatternsByType(patternType) {
    const response = await api.get('/emergent-patterns/by_type/', {
      params: { pattern_type: patternType }
    });
    return response.data;
  }

  async getNetworkAnalysis(params = {}) {
    const response = await api.get('/network-analysis/', { params });
    return response.data;
  }

  async getCurrentNetworkAnalysis() {
    const response = await api.get('/network-analysis/current/');
    return response.data;
  }

  async getNetworkTrend(days = 7) {
    const response = await api.get('/network-analysis/trend/', {
      params: { days }
    });
    return response.data;
  }

  // Dashboard endpoints
  async getAnalyticsSummary() {
    const response = await api.get('/dashboard/summary/');
    return response.data;
  }

  async getRealTimeData() {
    const response = await api.get('/dashboard/real_time/');
    return response.data;
  }
}

export default new APIService();
