import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import PublicFeed from './pages/PublicFeed';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
    return (
    <SupabaseAuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicFeed />} />

          {/* Protected dashboard routes */}
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Routes>
    </SupabaseAuthProvider>
  );
};

export default App;
