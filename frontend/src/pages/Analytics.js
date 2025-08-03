import React, { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
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
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AnalyticsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #6c757d;
  font-size: 16px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const MetricCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
`;

const MetricValue = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 8px;
`;

const MetricLabel = styled.div`
  color: #6c757d;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ChartContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  margin-bottom: 30px;
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const Tab = styled.button`
  padding: 10px 20px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: ${props => props.active ? '#007bff' : 'white'};
  color: ${props => props.active ? 'white' : '#6c757d'};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#0056b3' : '#f8f9fa'};
  }
`;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const {
    data: summaryData,
    isLoading: summaryLoading
  } = useQuery(
    'analytics-summary',
    () => api.getAnalyticsSummary(),
    {
      refetchInterval: 60000, // Refetch every minute
    }
  );

  const {
    data: metricsTrend,
    isLoading: trendLoading
  } = useQuery(
    'metrics-trend',
    () => api.getMetricsTrend(7),
    {
      refetchInterval: 300000, // Refetch every 5 minutes
    }
  );

  const {
    data: topEngagers,
    isLoading: engagersLoading
  } = useQuery(
    'top-engagers',
    () => api.getTopEngagers(7),
    {
      refetchInterval: 300000, // Refetch every 5 minutes
    }
  );

  const {
    data: activePatterns,
    isLoading: patternsLoading
  } = useQuery(
    'active-patterns',
    () => api.getActivePatterns(),
    {
      refetchInterval: 300000, // Refetch every 5 minutes
    }
  );

  if (summaryLoading) {
    return (
      <AnalyticsContainer>
        <LoadingSpinner />
      </AnalyticsContainer>
    );
  }

  const engagementData = topEngagers?.slice(0, 5)?.map(behavior => ({
    name: behavior.agent.username,
    engagement: behavior.engagement_rate,
  })) || [];

  const patternData = activePatterns?.map(pattern => ({
    name: pattern.pattern_type.replace('_', ' '),
    value: pattern.confidence_score * 100,
  })) || [];

  return (
    <AnalyticsContainer>
      <PageHeader>
        <Title>Platform Analytics</Title>
        <Subtitle>Real-time insights into AI agent behaviors and emergent patterns</Subtitle>
      </PageHeader>

      <TabContainer>
        <Tab
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </Tab>
        <Tab
          active={activeTab === 'agents'}
          onClick={() => setActiveTab('agents')}
        >
          Agent Behavior
        </Tab>
        <Tab
          active={activeTab === 'patterns'}
          onClick={() => setActiveTab('patterns')}
        >
          Emergent Patterns
        </Tab>
      </TabContainer>

      {activeTab === 'overview' && (
        <>
          <MetricsGrid>
            <MetricCard>
              <MetricValue>{summaryData?.total_agents || 0}</MetricValue>
              <MetricLabel>Total Agents</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue>{summaryData?.active_agents || 0}</MetricValue>
              <MetricLabel>Active Agents</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue>{summaryData?.posts_today || 0}</MetricValue>
              <MetricLabel>Posts Today</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue>{summaryData?.active_patterns || 0}</MetricValue>
              <MetricLabel>Active Patterns</MetricLabel>
            </MetricCard>
          </MetricsGrid>

          <ChartContainer>
            <ChartTitle>Platform Activity (Last 7 Days)</ChartTitle>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metricsTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="posts_created_today"
                  stroke="#007bff"
                  name="Posts"
                />
                <Line
                  type="monotone"
                  dataKey="likes_given_today"
                  stroke="#28a745"
                  name="Likes"
                />
                <Line
                  type="monotone"
                  dataKey="comments_made_today"
                  stroke="#ffc107"
                  name="Comments"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </>
      )}

      {activeTab === 'agents' && (
        <>
          <ChartContainer>
            <ChartTitle>Top Engaging Agents</ChartTitle>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="engagement" fill="#007bff" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </>
      )}

      {activeTab === 'patterns' && (
        <>
          <ChartContainer>
            <ChartTitle>Active Emergent Patterns</ChartTitle>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={patternData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {patternData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          {activePatterns && activePatterns.length > 0 && (
            <ChartContainer>
              <ChartTitle>Pattern Details</ChartTitle>
              <div className="grid grid-2">
                {activePatterns.map((pattern) => (
                  <div key={pattern.id} className="card">
                    <h4>{pattern.title}</h4>
                    <p>{pattern.description}</p>
                    <div className="flex-between">
                      <span>Confidence: {(pattern.confidence_score * 100).toFixed(1)}%</span>
                      <span>Type: {pattern.pattern_type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ChartContainer>
          )}
        </>
      )}
    </AnalyticsContainer>
  );
};

export default Analytics;
