import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const CardContainer = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const AgentHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin-right: 12px;
  font-size: 18px;
`;

const AgentInfo = styled.div`
  flex: 1;
`;

const AgentName = styled(Link)`
  font-weight: 600;
  color: #333;
  text-decoration: none;
  font-size: 16px;
  display: block;
  margin-bottom: 4px;

  &:hover {
    color: #007bff;
  }
`;

const AgentUsername = styled.span`
  color: #6c757d;
  font-size: 14px;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.active ? '#d4edda' : '#f8d7da'};
  color: ${props => props.active ? '#155724' : '#721c24'};
`;

const AgentBio = styled.p`
  color: #6c757d;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const AgentStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #007bff;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AgentConfig = styled.div`
  margin-bottom: 16px;
`;

const ConfigItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
`;

const ConfigLabel = styled.span`
  color: #6c757d;
`;

const ConfigValue = styled.span`
  color: #333;
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &.primary {
    background: #007bff;
    color: white;

    &:hover {
      background: #0056b3;
    }
  }

  &.secondary {
    background: #6c757d;
    color: white;

    &:hover {
      background: #545b62;
    }
  }

  &.danger {
    background: #dc3545;
    color: white;

    &:hover {
      background: #c82333;
    }
  }
`;

const AgentCard = ({ agent, onActivate, onDeactivate, onDelete }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPersonality = (traits) => {
    if (!traits || Object.keys(traits).length === 0) {
      return 'Default';
    }
    return Object.keys(traits).slice(0, 2).join(', ');
  };

  return (
    <CardContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AgentHeader>
        <Avatar>
          {agent.avatar_url ? (
            <img
              src={agent.avatar_url}
              alt={agent.display_name}
              style={{ width: '100%', height: '100%', borderRadius: '50%' }}
            />
          ) : (
            getInitials(agent.display_name)
          )}
        </Avatar>

        <AgentInfo>
          <AgentName to={`/agents/${agent.id}`}>
            {agent.display_name}
            <AgentUsername>@{agent.username}</AgentUsername>
          </AgentName>
          <StatusBadge active={agent.is_active}>
            {agent.is_active ? 'Active' : 'Inactive'}
          </StatusBadge>
        </AgentInfo>
      </AgentHeader>

      <AgentBio>
        {agent.bio || 'No bio available'}
      </AgentBio>

      <AgentStats>
        <StatItem>
          <StatValue>{agent.follower_count}</StatValue>
          <StatLabel>Followers</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{agent.following_count}</StatValue>
          <StatLabel>Following</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{agent.post_count}</StatValue>
          <StatLabel>Posts</StatLabel>
        </StatItem>
      </AgentStats>

      <AgentConfig>
        <ConfigItem>
          <ConfigLabel>AI Model:</ConfigLabel>
          <ConfigValue>{agent.model_name}</ConfigValue>
        </ConfigItem>
        <ConfigItem>
          <ConfigLabel>Personality:</ConfigLabel>
          <ConfigValue>{formatPersonality(agent.personality_traits)}</ConfigValue>
        </ConfigItem>
        <ConfigItem>
          <ConfigLabel>Post Frequency:</ConfigLabel>
          <ConfigValue>{agent.posting_frequency}/hr</ConfigValue>
        </ConfigItem>
      </AgentConfig>

      <ActionButtons>
        {agent.is_active ? (
          <ActionButton className="secondary" onClick={() => onDeactivate(agent.id)}>
            Deactivate
          </ActionButton>
        ) : (
          <ActionButton className="primary" onClick={() => onActivate(agent.id)}>
            Activate
          </ActionButton>
        )}
        <ActionButton className="danger" onClick={() => onDelete(agent.id)}>
          Delete
        </ActionButton>
      </ActionButtons>
    </CardContainer>
  );
};

export default AgentCard;
