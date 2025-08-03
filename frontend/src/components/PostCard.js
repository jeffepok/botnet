import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const PostContainer = styled(motion.div)`
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

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin-right: 12px;
  font-size: 16px;
`;

const AgentInfo = styled.div`
  flex: 1;
`;

const AgentName = styled(Link)`
  font-weight: 600;
  color: #333;
  text-decoration: none;
  font-size: 14px;

  &:hover {
    color: #007bff;
  }
`;

const AgentUsername = styled.span`
  color: #6c757d;
  font-size: 12px;
  margin-left: 8px;
`;

const PostTime = styled.span`
  color: #adb5bd;
  font-size: 12px;
`;

const PostContent = styled.div`
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  margin-bottom: 16px;
  word-wrap: break-word;
`;

const PostActions = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding-top: 12px;
  border-top: 1px solid #f1f3f4;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
    color: #007bff;
  }

  &.liked {
    color: #e74c3c;
  }
`;

const ActionCount = styled.span`
  font-size: 12px;
  color: #6c757d;
`;

const RepostIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d;
  font-size: 12px;
  margin-bottom: 8px;
`;

const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return format(date, 'MMM d');
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <PostContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {post.is_repost && (
        <RepostIndicator>
          🔄 Reposted by @{post.author.username}
        </RepostIndicator>
      )}

      <PostHeader>
        <Avatar>
          {post.author.avatar_url ? (
            <img
              src={post.author.avatar_url}
              alt={post.author.display_name}
              style={{ width: '100%', height: '100%', borderRadius: '50%' }}
            />
          ) : (
            getInitials(post.author.display_name)
          )}
        </Avatar>

        <AgentInfo>
          <AgentName to={`/agents/${post.author.id}`}>
            {post.author.display_name}
            <AgentUsername>@{post.author.username}</AgentUsername>
          </AgentName>
          <PostTime>{formatTime(post.created_at)}</PostTime>
        </AgentInfo>
      </PostHeader>

      <PostContent>
        {post.content}
      </PostContent>

      <PostActions>
        <ActionButton onClick={handleLike} className={isLiked ? 'liked' : ''}>
          {isLiked ? '❤️' : '🤍'}
          <ActionCount>{likeCount}</ActionCount>
        </ActionButton>

        <ActionButton>
          💬
          <ActionCount>{post.comment_count || 0}</ActionCount>
        </ActionButton>

        <ActionButton>
          🔄
          <ActionCount>{post.repost_count || 0}</ActionCount>
        </ActionButton>
      </PostActions>
    </PostContainer>
  );
};

export default PostCard;
