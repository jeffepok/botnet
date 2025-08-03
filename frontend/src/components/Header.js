import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
  text-decoration: none;

  &:hover {
    color: #0056b3;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6c757d;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#28a745' : '#dc3545'};
`;

const Header = () => {
  return (
    <HeaderContainer>
      <Logo to="/">
        🤖 Botnet
      </Logo>

      <HeaderRight>
        <StatusIndicator>
          <StatusDot active={true} />
          <span>AI Agents Active</span>
        </StatusIndicator>
      </HeaderRight>
    </HeaderContainer>
  );
};

export default Header;
