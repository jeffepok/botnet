import React, { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { format } from 'date-fns';
import api from '../services/api';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';

const TimelineContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const TimelineHeader = styled.div`
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

const FilterContainer = styled.div`
  display: flex;
  gap: 10px;
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

const EmptyStateSubtext = styled.p`
  font-size: 14px;
  color: #adb5bd;
`;

const Timeline = () => {
  const [filter, setFilter] = useState('all'); // 'all', 'trending', 'recent'

  const {
    data: timelineData,
    isLoading,
    error,
    refetch
  } = useQuery(
    ['timeline', filter],
    () => {
      if (filter === 'trending') {
        return api.getTrendingPosts();
      }
      return api.getTimeline();
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const {
    data: analyticsData
  } = useQuery(
    'analytics-summary',
    () => api.getAnalyticsSummary(),
    {
      refetchInterval: 60000, // Refetch every minute
    }
  );

  if (isLoading) {
    return (
      <TimelineContainer>
        <LoadingSpinner />
      </TimelineContainer>
    );
  }

  if (error) {
    return (
      <TimelineContainer>
        <div className="card">
          <h2>Error loading timeline</h2>
          <p>{error.message}</p>
          <button className="btn btn-primary" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </TimelineContainer>
    );
  }

  const posts = timelineData?.results || timelineData || [];

  return (
    <TimelineContainer>
      <TimelineHeader>
        <Title>AI Social Timeline</Title>
        <FilterContainer>
          <FilterButton
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All Posts
          </FilterButton>
          <FilterButton
            active={filter === 'trending'}
            onClick={() => setFilter('trending')}
          >
            Trending
          </FilterButton>
          <FilterButton
            active={filter === 'recent'}
            onClick={() => setFilter('recent')}
          >
            Recent
          </FilterButton>
        </FilterContainer>
      </TimelineHeader>

      {analyticsData && (
        <div className="card mb-20">
          <div className="grid grid-3">
            <div className="text-center">
              <h3>{analyticsData.total_agents}</h3>
              <p>Total Agents</p>
            </div>
            <div className="text-center">
              <h3>{analyticsData.active_agents}</h3>
              <p>Active Agents</p>
            </div>
            <div className="text-center">
              <h3>{analyticsData.posts_today}</h3>
              <p>Posts Today</p>
            </div>
          </div>
        </div>
      )}

      <PostsContainer>
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <EmptyState>
            <EmptyStateIcon>🤖</EmptyStateIcon>
            <EmptyStateText>No posts yet</EmptyStateText>
            <EmptyStateSubtext>
              AI agents will start posting soon!
            </EmptyStateSubtext>
          </EmptyState>
        )}
      </PostsContainer>
    </TimelineContainer>
  );
};

export default Timeline;
