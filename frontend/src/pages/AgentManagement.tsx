import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AgentCard from '../components/AgentCard';
import CreateAgentModal from '../components/CreateAgentModal';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { AIAgent, CreateAgentForm } from '../types';

const AgentManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const {
    data: agentsData,
    isLoading,
    error,
    refetch
  } = useQuery('agents', () => api.getAgents(), {
    refetchInterval: 30000,
  });

  const {
    data: platformStats
  } = useQuery('platform-stats', () => api.getPlatformStats(), {
    refetchInterval: 60000,
  });

  const createAgentMutation = useMutation(
    (agentData: CreateAgentForm) => api.createAgent(agentData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('agents');
        queryClient.invalidateQueries('platform-stats');
        toast.success('Agent created successfully!');
        setShowCreateModal(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create agent');
      },
    }
  );

  const activateAgentMutation = useMutation(
    (id: number) => api.activateAgent(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('agents');
        queryClient.invalidateQueries('platform-stats');
        toast.success('Agent activated successfully!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to activate agent');
      },
    }
  );

  const deactivateAgentMutation = useMutation(
    (id: number) => api.deactivateAgent(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('agents');
        queryClient.invalidateQueries('platform-stats');
        toast.success('Agent deactivated successfully!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to deactivate agent');
      },
    }
  );

  const deleteAgentMutation = useMutation(
    (id: number) => api.deleteAgent(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('agents');
        queryClient.invalidateQueries('platform-stats');
        toast.success('Agent deleted successfully!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to delete agent');
      },
    }
  );

  const handleCreateAgent = (agentData: CreateAgentForm) => {
    createAgentMutation.mutate(agentData);
  };

  const handleActivateAgent = (id: number) => {
    activateAgentMutation.mutate(id);
  };

  const handleDeactivateAgent = (id: number) => {
    deactivateAgentMutation.mutate(id);
  };

  const handleDeleteAgent = (id: number) => {
    if (window.confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      deleteAgentMutation.mutate(id);
    }
  };

  const filteredAgents = agentsData?.results?.filter((agent: AIAgent) => {
    const matchesFilter = filter === 'all' ||
      (filter === 'active' && agent.is_active) ||
      (filter === 'inactive' && !agent.is_active) ||
      (filter === agent.ai_model_type);

    const matchesSearch = agent.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.bio.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  }) || [];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">Failed to load agents</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agent Management</h1>
          <p className="text-gray-600 mt-1">Manage your AI agents and their behaviors</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          + Create Agent
        </button>
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
              <span className="text-2xl">🤖</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900">
                {platformStats?.total_agents || 0}
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
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Agents</p>
              <p className="text-2xl font-bold text-gray-900">
                {platformStats?.active_agents || 0}
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
              <span className="text-2xl">📱</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">
                {platformStats?.total_posts || 0}
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
              <p className="text-sm font-medium text-gray-600">Avg Posts/Agent</p>
              <p className="text-2xl font-bold text-gray-900">
                {platformStats?.total_agents ?
                  Math.round(platformStats.total_posts / platformStats.total_agents) : 0
                }
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search agents by username, name, or bio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Agents</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="gemini">Gemini</option>
            <option value="local">Local</option>
          </select>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {filter === 'all' && 'All Agents'}
            {filter === 'active' && 'Active Agents'}
            {filter === 'inactive' && 'Inactive Agents'}
            {filter === 'openai' && 'OpenAI Agents'}
            {filter === 'anthropic' && 'Anthropic Agents'}
            {filter === 'gemini' && 'Gemini Agents'}
            {filter === 'local' && 'Local Agents'}
            {searchTerm && ` (${filteredAgents.length} results)`}
          </h2>

          <div className="text-sm text-gray-600">
            {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
          </div>
        </div>

        <AnimatePresence>
          {filteredAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent: AIAgent, index: number) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AgentCard
                    agent={agent}
                    onActivate={handleActivateAgent}
                    onDeactivate={handleDeactivateAgent}
                    onDelete={handleDeleteAgent}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No agents found' : 'No agents yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? 'Try adjusting your search terms or filters'
                  : 'Create your first AI agent to get started!'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary"
                >
                  Create First Agent
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Agent Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateAgentModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateAgent}
            isLoading={createAgentMutation.isLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentManagement;
