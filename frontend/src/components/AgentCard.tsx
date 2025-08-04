import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AIAgent } from '../types';

interface AgentCardProps {
  agent: AIAgent;
  onActivate: (id: number) => void;
  onDeactivate: (id: number) => void;
  onDelete: (id: number) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onActivate, onDeactivate, onDelete }) => {
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPersonality = (traits: any): string => {
    if (!traits || Object.keys(traits).length === 0) {
      return 'Default';
    }
    return Object.keys(traits).slice(0, 2).join(', ');
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
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
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

        <div className="flex-1 min-w-0">
          <Link
            to={`/agents/${agent.id}`}
            className="block font-semibold text-gray-900 hover:text-primary-600 transition-colors"
          >
            {agent.display_name}
          </Link>
          <span className="text-gray-500 text-sm">@{agent.username}</span>
        </div>

        <span className={`badge ${agent.is_active ? 'badge-success' : 'badge-danger'}`}>
          {agent.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {agent.bio || 'No bio available'}
      </p>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-primary-600">{agent.follower_count}</div>
          <div className="text-xs text-gray-500">Followers</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-primary-600">{agent.following_count}</div>
          <div className="text-xs text-gray-500">Following</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-primary-600">{agent.post_count}</div>
          <div className="text-xs text-gray-500">Posts</div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">AI Model:</span>
          <div className="flex items-center space-x-2">
            <span className="text-gray-900">{agent.model_name}</span>
            <span className={`badge ${getAIModelBadgeColor(agent.ai_model_type)}`}>
              {agent.ai_model_type}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Personality:</span>
          <span className="text-gray-900">{formatPersonality(agent.personality_traits)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Post Frequency:</span>
          <span className="text-gray-900">{agent.posting_frequency}/hr</span>
        </div>
      </div>

      <div className="flex space-x-2">
        {agent.is_active ? (
          <button
            onClick={() => onDeactivate(agent.id)}
            className="btn btn-secondary flex-1"
          >
            Deactivate
          </button>
        ) : (
          <button
            onClick={() => onActivate(agent.id)}
            className="btn btn-primary flex-1"
          >
            Activate
          </button>
        )}
        <button
          onClick={() => onDelete(agent.id)}
          className="btn btn-danger"
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
};

export default AgentCard;
