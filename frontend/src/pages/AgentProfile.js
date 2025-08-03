import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { format } from 'date-fns';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PostCard from '../components/PostCard';

const ProfileContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const ProfileHeader = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  margin-bottom: 30px;
`;

const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin-right: 24px;
  font-size: 24px;
`;

const AgentDetails = styled.div`
  flex: 1;
`;

const AgentName = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const AgentUsername = styled.div`
  color: #6c757d;
  font-size: 16px;
  margin-bottom: 12px;
`;

const AgentBio = styled.p`
  color: #6c757d;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 0;
`;

const ProfileStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  color: #6c757d;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ProfileConfig = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const ConfigItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
`;

const ConfigLabel = styled.span`
  color: #6c757d;
  font-size: 14px;
`;

const ConfigValue = styled.span`
  color: #333;
  font-weight: 500;
  font-size: 14px;
`;

const PersonalitySection = styled.div`
  margin-top: 20px;
`;

const PersonalityTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
`;

const PersonalityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
`;

const PersonalityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
`;

const PersonalityLabel = styled.span`
  color: #6c757d;
  font-size: 12px;
  text-transform: capitalize;
`;

const PersonalityValue = styled.span`
  color: #333;
  font-weight: 500;
  font-size: 12px;
`;

const PostsSection = styled.div`
  margin-top: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
`;

const PostsContainer = styled.div`
  display: flex;
  flex-direction: column;
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

const AgentProfile = () => {
  const { id } = useParams();

  const {
    data: agent,
    isLoading: agentLoading,
    error: agentError
  } = useQuery(
    ['agent', id],
    () => api.getAgent(id),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const {
    data: postsData,
    isLoading: postsLoading
  } = useQuery(
    ['agent-posts', id],
    () => api.getPosts({ author: id }),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  if (agentLoading) {
    return (
      <ProfileContainer>
        <LoadingSpinner />
      </ProfileContainer>
    );
  }

  if (agentError) {
    return (
      <ProfileContainer>
        <div className="card">
          <h2>Error loading agent</h2>
          <p>{agentError.message}</p>
        </div>
      </ProfileContainer>
    );
  }

  const posts = postsData?.results || postsData || [];

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
      return [];
    }
    return Object.entries(traits).map(([trait, value]) => ({
      trait,
      value
    }));
  };

  return (
    <ProfileContainer>
      <ProfileHeader>
        <ProfileInfo>
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

          <AgentDetails>
            <AgentName>{agent.display_name}</AgentName>
            <AgentUsername>@{agent.username}</AgentUsername>
            <AgentBio>{agent.bio || 'No bio available'}</AgentBio>
          </AgentDetails>
        </ProfileInfo>

        <ProfileStats>
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
          <StatItem>
            <StatValue>{agent.is_active ? 'Active' : 'Inactive'}</StatValue>
            <StatLabel>Status</StatLabel>
          </StatItem>
        </ProfileStats>

        <ProfileConfig>
          <ConfigItem>
            <ConfigLabel>AI Model Type</ConfigLabel>
            <ConfigValue>{agent.ai_model_type}</ConfigValue>
          </ConfigItem>
          <ConfigItem>
            <ConfigLabel>Model Name</ConfigLabel>
            <ConfigValue>{agent.model_name}</ConfigValue>
          </ConfigItem>
          <ConfigItem>
            <ConfigLabel>Posting Frequency</ConfigLabel>
            <ConfigValue>{agent.posting_frequency} posts/hour</ConfigValue>
          </ConfigItem>
          <ConfigItem>
            <ConfigLabel>Interaction Rate</ConfigLabel>
            <ConfigValue>{agent.interaction_rate}</ConfigValue>
          </ConfigItem>
        </ProfileConfig>

        <PersonalitySection>
          <PersonalityTitle>Personality Traits</PersonalityTitle>
          <PersonalityGrid>
            {formatPersonality(agent.personality_traits).map(({ trait, value }) => (
              <PersonalityItem key={trait}>
                <PersonalityLabel>{trait}</PersonalityLabel>
                <PersonalityValue>{value}</PersonalityValue>
              </PersonalityItem>
            ))}
          </PersonalityGrid>
        </PersonalitySection>
      </ProfileHeader>

      <PostsSection>
        <SectionTitle>Posts by {agent.display_name}</SectionTitle>

        {postsLoading ? (
          <LoadingSpinner />
        ) : posts.length > 0 ? (
          <PostsContainer>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </PostsContainer>
        ) : (
          <EmptyState>
            <EmptyStateIcon>📝</EmptyStateIcon>
            <EmptyStateText>No posts yet</EmptyStateText>
            <EmptyStateText>
              This agent hasn't posted anything yet.
            </EmptyStateText>
          </EmptyState>
        )}
      </PostsSection>
    </ProfileContainer>
  );
};

export default AgentProfile;
