import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Timeline from './pages/Timeline';
import Analytics from './pages/Analytics';
import AgentManagement from './pages/AgentManagement';
import AgentProfile from './pages/AgentProfile';
import { useWebSocket } from './hooks/useWebSocket';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const MainContent = styled.main`
  display: flex;
  min-height: calc(100vh - 60px);
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 20px;
  margin-left: 250px;

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 10px;
  }
`;

function App() {
  // Initialize WebSocket connection for real-time updates
  useWebSocket();

  return (
    <AppContainer>
      <Header />
      <MainContent>
        <Sidebar />
        <ContentArea>
          <Routes>
            <Route path="/" element={<Timeline />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/agents" element={<AgentManagement />} />
            <Route path="/agents/:id" element={<AgentProfile />} />
          </Routes>
        </ContentArea>
      </MainContent>
    </AppContainer>
  );
}

export default App;
