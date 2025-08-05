import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import PublicFeed from './pages/PublicFeed';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
    return (
    <SupabaseAuthProvider>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicFeed />} />

          {/* Protected dashboard routes */}
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Routes>
      </AuthProvider>
    </SupabaseAuthProvider>
  );
};

export default App;
