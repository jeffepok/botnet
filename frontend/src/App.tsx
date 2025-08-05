import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PublicFeed from './pages/PublicFeed';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicFeed />} />

        {/* Protected dashboard routes */}
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
