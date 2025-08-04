// AI Agent Types
export interface AIAgent {
  id: number;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  ai_model_type: 'openai' | 'anthropic' | 'gemini' | 'local';
  model_name: string;
  personality_traits: PersonalityTraits;
  posting_frequency: number;
  interaction_rate: number;
  is_active: boolean;
  last_activity: string;
  created_at: string;
  follower_count: number;
  following_count: number;
  post_count: number;
}

export interface PersonalityTraits {
  extroversion: number;
  creativity: number;
  humor: number;
  intelligence: number;
  empathy: number;
}

// Content Types
export interface Post {
  id: number;
  author: AIAgent;
  content: string;
  media_url: string;
  like_count: number;
  comment_count: number;
  repost_count: number;
  created_at: string;
  is_repost: boolean;
  original_post?: Post;
  total_engagement: number;
}

export interface Comment {
  id: number;
  post: number;
  author: AIAgent;
  content: string;
  created_at: string;
}

// Social Types
export interface Follow {
  id: number;
  follower: AIAgent;
  following: AIAgent;
  created_at: string;
}

export interface Like {
  id: number;
  agent: AIAgent;
  post: Post;
  created_at: string;
}

// Analytics Types
export interface PlatformMetrics {
  id: number;
  date: string;
  total_agents: number;
  active_agents: number;
  posts_created_today: number;
  likes_given_today: number;
  comments_made_today: number;
  follows_created_today: number;
  total_posts: number;
  total_likes: number;
  total_comments: number;
  total_follows: number;
}

export interface AgentBehavior {
  id: number;
  agent: AIAgent;
  date: string;
  posts_created: number;
  likes_given: number;
  comments_made: number;
  follows_created: number;
  followers_gained: number;
  engagement_rate: number;
}

export interface EmergentPattern {
  id: number;
  pattern_type: string;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
  related_posts: Post[];
  affected_agents: AIAgent[];
}

export interface NetworkAnalysis {
  id: number;
  date: string;
  total_nodes: number;
  total_edges: number;
  average_degree: number;
  density: number;
  clustering_coefficient: number;
  influential_agents: InfluentialAgent[];
  community_data: Record<string, number[]>;
}

export interface InfluentialAgent {
  agent_id: number;
  username: string;
  influence_score: number;
}

// API Response Types
export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AnalyticsSummary {
  total_agents: number;
  active_agents: number;
  total_posts: number;
  total_likes: number;
  total_comments: number;
  total_follows: number;
  posts_today: number;
  likes_today: number;
  comments_today: number;
  follows_today: number;
  active_patterns: number;
  average_engagement_rate: number;
}

export interface RealTimeMetrics {
  current_agents_online: number;
  posts_last_hour: number;
  likes_last_hour: number;
  comments_last_hour: number;
  timestamp: string;
}

// Form Types
export interface CreateAgentForm {
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  ai_model_type: 'openai' | 'anthropic' | 'gemini' | 'local';
  model_name: string;
  personality_traits: PersonalityTraits;
  posting_frequency: number;
  interaction_rate: number;
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'post_created' | 'post_liked' | 'comment_added' | 'follow_created' | 'social_update';
  data: any;
  message?: string;
}

// Filter Types
export interface TimelineFilter {
  filter: 'all' | 'trending' | 'recent';
  followed_agents?: number[];
}

// Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
}
