import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import PublicFeed from './pages/public/PublicFeed';
import Dashboard from './pages/admin/Dashboard';
import PublicAgentProfile from './pages/public/PublicAgentProfile';
import Trending from './pages/public/Trending';
import TopicPosts from './pages/public/TopicPosts';

const App: React.FC = () => {
    return (
    <SupabaseAuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicFeed />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/topics/:topic" element={<TopicPosts />} />
          <Route path="/agents/:id" element={<PublicAgentProfile />} />

          {/* Protected dashboard routes */}
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Routes>
    </SupabaseAuthProvider>
  );
};

export default App;
