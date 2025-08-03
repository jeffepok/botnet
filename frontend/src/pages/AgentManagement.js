import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AgentCard from '../components/AgentCard';
import CreateAgentModal from '../components/CreateAgentModal';

const AgentManagementContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #333;
`;

const CreateButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #0056b3;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  background: ${props => props.active ? '#007bff' : 'white'};
  color: ${props => props.active ? 'white' : '#6c757d'};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#0056b3' : '#f8f9fa'};
  }
`;

const AgentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  margin-bottom: 10px;
`;

const EmptyStateSubtext = styled.p`
  font-size: 14px;
  color: #adb5bd;
`;

const AgentManagement = () => {
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: agentsData,
    isLoading,
    error
  } = useQuery(
    ['agents', filter],
    () => api.getAgents({ is_active: filter === 'active' ? 'true' : filter === 'inactive' ? 'false' : undefined }),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const createAgentMutation = useMutation(
    (agentData) => api.createAgent(agentData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['agents']);
        toast.success('Agent created successfully!');
        setShowCreateModal(false);
      },
      onError: (error) => {
        toast.error(`Failed to create agent: ${error.message}`);
      },
    }
  );

  const activateAgentMutation = useMutation(
    (agentId) => api.activateAgent(agentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['agents']);
        toast.success('Agent activated!');
      },
      onError: (error) => {
        toast.error(`Failed to activate agent: ${error.message}`);
      },
    }
  );

  const deactivateAgentMutation = useMutation(
    (agentId) => api.deactivateAgent(agentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['agents']);
        toast.success('Agent deactivated!');
      },
      onError: (error) => {
        toast.error(`Failed to deactivate agent: ${error.message}`);
      },
    }
  );

  const deleteAgentMutation = useMutation(
    (agentId) => api.deleteAgent(agentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['agents']);
        toast.success('Agent deleted!');
      },
      onError: (error) => {
        toast.error(`Failed to delete agent: ${error.message}`);
      },
    }
  );

  const handleCreateAgent = (agentData) => {
    createAgentMutation.mutate(agentData);
  };

  const handleActivateAgent = (agentId) => {
    activateAgentMutation.mutate(agentId);
  };

  const handleDeactivateAgent = (agentId) => {
    deactivateAgentMutation.mutate(agentId);
  };

  const handleDeleteAgent = (agentId) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      deleteAgentMutation.mutate(agentId);
    }
  };

  if (isLoading) {
    return (
      <AgentManagementContainer>
        <LoadingSpinner />
      </AgentManagementContainer>
    );
  }

  if (error) {
    return (
      <AgentManagementContainer>
        <div className="card">
          <h2>Error loading agents</h2>
          <p>{error.message}</p>
        </div>
      </AgentManagementContainer>
    );
  }

  const agents = agentsData?.results || agentsData || [];

  return (
    <AgentManagementContainer>
      <PageHeader>
        <Title>Agent Management</Title>
        <CreateButton onClick={() => setShowCreateModal(true)}>
          + Create Agent
        </CreateButton>
      </PageHeader>

      <FilterContainer>
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          All Agents ({agents.length})
        </FilterButton>
        <FilterButton
          active={filter === 'active'}
          onClick={() => setFilter('active')}
        >
          Active ({agents.filter(a => a.is_active).length})
        </FilterButton>
        <FilterButton
          active={filter === 'inactive'}
          onClick={() => setFilter('inactive')}
        >
          Inactive ({agents.filter(a => !a.is_active).length})
        </FilterButton>
      </FilterContainer>

      {agents.length > 0 ? (
        <AgentsGrid>
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onActivate={() => handleActivateAgent(agent.id)}
              onDeactivate={() => handleDeactivateAgent(agent.id)}
              onDelete={() => handleDeleteAgent(agent.id)}
            />
          ))}
        </AgentsGrid>
      ) : (
        <EmptyState>
          <EmptyStateIcon>🤖</EmptyStateIcon>
          <EmptyStateText>No agents found</EmptyStateText>
          <EmptyStateSubtext>
            Create your first AI agent to get started!
          </EmptyStateSubtext>
        </EmptyState>
      )}

      {showCreateModal && (
        <CreateAgentModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAgent}
          isLoading={createAgentMutation.isLoading}
        />
      )}
    </AgentManagementContainer>
  );
};

export default AgentManagement;
