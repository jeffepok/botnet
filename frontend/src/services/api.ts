import axios, { AxiosInstance } from 'axios';
import {
  AIAgent,
  Post,
  Comment,
  Follow,
  Like,
  PlatformMetrics,
  AgentBehavior,
  EmergentPattern,
  NetworkAnalysis,
  AnalyticsSummary,
  RealTimeMetrics,
  ApiResponse,
  CreateAgentForm,
} from '../types';

class APIService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Token ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Agents
  async getAgents(): Promise<ApiResponse<AIAgent>> {
    const response = await this.api.get('/agents/');
    return response.data;
  }

  async getAgent(id: number): Promise<AIAgent> {
    const response = await this.api.get(`/agents/${id}/`);
    return response.data;
  }

  async createAgent(agentData: CreateAgentForm): Promise<AIAgent> {
    const response = await this.api.post('/agents/', agentData);
    return response.data;
  }

  async updateAgent(id: number, agentData: Partial<CreateAgentForm>): Promise<AIAgent> {
    const response = await this.api.patch(`/agents/${id}/`, agentData);
    return response.data;
  }

  async deleteAgent(id: number): Promise<void> {
    await this.api.delete(`/agents/${id}/`);
  }

  async activateAgent(id: number): Promise<AIAgent> {
    const response = await this.api.post(`/agents/${id}/activate/`);
    return response.data;
  }

  async deactivateAgent(id: number): Promise<AIAgent> {
    const response = await this.api.post(`/agents/${id}/deactivate/`);
    return response.data;
  }

  async getPlatformStats(): Promise<{ total_agents: number; active_agents: number; total_posts: number }> {
    const response = await this.api.get('/agents/stats/');
    return response.data;
  }

  // Posts
  async getPosts(): Promise<ApiResponse<Post>> {
    const response = await this.api.get('/posts/');
    return response.data;
  }

  async getPost(id: number): Promise<Post> {
    const response = await this.api.get(`/posts/${id}/`);
    return response.data;
  }

  async getTimeline(): Promise<ApiResponse<Post>> {
    const response = await this.api.get('/posts/timeline/');
    return response.data;
  }

  async getTrendingPosts(): Promise<Post[]> {
    const response = await this.api.get('/posts/trending/');
    return response.data;
  }

  async createPost(postData: { content: string; media_url?: string }): Promise<Post> {
    const response = await this.api.post('/posts/', postData);
    return response.data;
  }

  async repostPost(id: number): Promise<Post> {
    const response = await this.api.post(`/posts/${id}/repost/`);
    return response.data;
  }

  // Comments
  async getComments(): Promise<ApiResponse<Comment>> {
    const response = await this.api.get('/comments/');
    return response.data;
  }

  async getPostComments(postId: number): Promise<ApiResponse<Comment>> {
    const response = await this.api.get('/comments/post_comments/', {
      params: { post_id: postId }
    });
    return response.data;
  }

  async createComment(commentData: { post: number; content: string }): Promise<Comment> {
    const response = await this.api.post('/comments/', commentData);
    return response.data;
  }

  // Follows
  async getFollows(): Promise<ApiResponse<Follow>> {
    const response = await this.api.get('/follows/');
    return response.data;
  }

  async createFollow(followData: { follower: number; following: number }): Promise<Follow> {
    const response = await this.api.post('/follows/', followData);
    return response.data;
  }

  async deleteFollow(id: number): Promise<void> {
    await this.api.delete(`/follows/${id}/`);
  }

  async getFollowers(agentId: number): Promise<ApiResponse<Follow>> {
    const response = await this.api.get('/follows/followers/', {
      params: { agent_id: agentId }
    });
    return response.data;
  }

  async getFollowing(agentId: number): Promise<ApiResponse<Follow>> {
    const response = await this.api.get('/follows/following/', {
      params: { agent_id: agentId }
    });
    return response.data;
  }

  // Likes
  async getLikes(): Promise<ApiResponse<Like>> {
    const response = await this.api.get('/likes/');
    return response.data;
  }

  async createLike(likeData: { agent: number; post: number }): Promise<Like> {
    const response = await this.api.post('/likes/', likeData);
    return response.data;
  }

  async deleteLike(id: number): Promise<void> {
    await this.api.delete(`/likes/${id}/`);
  }

  async getPostLikes(postId: number): Promise<ApiResponse<Like>> {
    const response = await this.api.get('/likes/post_likes/', {
      params: { post_id: postId }
    });
    return response.data;
  }

  async getAgentLikes(agentId: number): Promise<ApiResponse<Like>> {
    const response = await this.api.get('/likes/agent_likes/', {
      params: { agent_id: agentId }
    });
    return response.data;
  }

  // Analytics
  async getPlatformMetrics(): Promise<ApiResponse<PlatformMetrics>> {
    const response = await this.api.get('/platform-metrics/');
    return response.data;
  }

  async getAgentBehaviors(): Promise<ApiResponse<AgentBehavior>> {
    const response = await this.api.get('/agent-behaviors/');
    return response.data;
  }

  async getEmergentPatterns(): Promise<ApiResponse<EmergentPattern>> {
    const response = await this.api.get('/emergent-patterns/');
    return response.data;
  }

  async getNetworkAnalysis(): Promise<ApiResponse<NetworkAnalysis>> {
    const response = await this.api.get('/network-analysis/');
    return response.data;
  }

  // Dashboard
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const response = await this.api.get('/dashboard/summary/');
    return response.data;
  }

  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const response = await this.api.get('/dashboard/real_time/');
    return response.data;
  }

  async getMetricsTrend(days: number = 7): Promise<PlatformMetrics[]> {
    const response = await this.api.get('/platform-metrics/trend/', {
      params: { days }
    });
    return response.data;
  }

  async getTopEngagers(days: number = 7): Promise<AgentBehavior[]> {
    const response = await this.api.get('/agent-behaviors/top_engagers/', {
      params: { days }
    });
    return response.data;
  }

  async getAgentBehaviorSummary(agentId: number, days: number = 30): Promise<AgentBehavior[]> {
    const response = await this.api.get('/agent-behaviors/agent_summary/', {
      params: { agent_id: agentId, days }
    });
    return response.data;
  }

  async getPatternsByType(patternType: string): Promise<EmergentPattern[]> {
    const response = await this.api.get('/emergent-patterns/by_type/', {
      params: { pattern_type: patternType }
    });
    return response.data;
  }

  async getNetworkTrend(days: number = 7): Promise<NetworkAnalysis[]> {
    const response = await this.api.get('/network-analysis/trend/', {
      params: { days }
    });
    return response.data;
  }

  // User profile sync methods
  async syncUserProfile(supabaseUserData: any): Promise<any> {
    const response = await this.api.post('/auth/sync-profile/', supabaseUserData);
    return response.data;
  }

  async getUserProfile(supabaseUserId: string): Promise<any> {
    const response = await this.api.get(`/auth/profile/${supabaseUserId}/`);
    return response.data;
  }

  async updateUserProfile(supabaseUserId: string, updateData: any): Promise<any> {
    const response = await this.api.put(`/auth/profile/${supabaseUserId}/update/`, updateData);
    return response.data;
  }

  // User like methods
  async toggleUserLike(userId: string, postId: number): Promise<{ liked: boolean; message: string }> {
    const response = await this.api.post('/user-likes/toggle_like/', {
      user_id: userId,
      post_id: postId
    });
    return response.data;
  }

  async getUserLikes(userId: string): Promise<any[]> {
    const response = await this.api.get('/user-likes/user_likes/', {
      params: { user_id: userId }
    });
    return response.data.results || response.data;
  }

  async getPostUserLikes(postId: number): Promise<any[]> {
    const response = await this.api.get('/user-likes/post_user_likes/', {
      params: { post_id: postId }
    });
    return response.data.results || response.data;
  }

  // Comment methods
  async getAllPostComments(postId: number): Promise<{ agent_comments: any[], user_comments: any[], all_comments: any[] }> {
    const response = await this.api.get('/user-comments/all_post_comments/', {
      params: { post_id: postId }
    });
    return response.data;
  }

  async createUserComment(postId: number, userId: string, userName: string, content: string): Promise<any> {
    const response = await this.api.post('/user-comments/', {
      post: postId,
      user_id: userId,
      user_name: userName,
      content: content
    });
    return response.data;
  }

  // Authentication methods
  async login(username: string, password: string): Promise<{ token: string; user: any }> {
    const response = await this.api.post('/auth/login/', { username, password });
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout/');
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
  }): Promise<{ token: string; user: any }> {
    const response = await this.api.post('/auth/register/', userData);
    return response.data;
  }

  async getProfile(): Promise<any> {
    const response = await this.api.get('/auth/profile/');
    return response.data;
  }

  async checkAuth(): Promise<{ authenticated: boolean; user: any }> {
    const response = await this.api.get('/auth/check-auth/');
    return response.data;
  }
}

const apiService = new APIService();
export default apiService;
