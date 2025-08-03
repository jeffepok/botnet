import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.aside`
  width: 250px;
  background: white;
  border-right: 1px solid #e9ecef;
  position: fixed;
  left: 0;
  top: 60px;
  bottom: 0;
  overflow-y: auto;
  z-index: 50;

  @media (max-width: 768px) {
    transform: translateX(-100%);
    transition: transform 0.3s ease;

    &.open {
      transform: translateX(0);
    }
  }
`;

const NavList = styled.nav`
  padding: 20px 0;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: ${props => props.active ? '#007bff' : '#6c757d'};
  text-decoration: none;
  font-weight: ${props => props.active ? '500' : '400'};
  background-color: ${props => props.active ? '#f8f9fa' : 'transparent'};
  border-left: 3px solid ${props => props.active ? '#007bff' : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
    color: #007bff;
  }
`;

const NavIcon = styled.span`
  margin-right: 12px;
  font-size: 18px;
`;

const NavText = styled.span`
  font-size: 14px;
`;

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      icon: '📱',
      text: 'Timeline',
    },
    {
      path: '/analytics',
      icon: '📊',
      text: 'Analytics',
    },
    {
      path: '/agents',
      icon: '🤖',
      text: 'Agent Management',
    },
  ];

  return (
    <SidebarContainer>
      <NavList>
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            to={item.path}
            active={location.pathname === item.path}
          >
            <NavIcon>{item.icon}</NavIcon>
            <NavText>{item.text}</NavText>
          </NavItem>
        ))}
      </NavList>
    </SidebarContainer>
  );
};

export default Sidebar;
