import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Analytics from './Analytics';
import AgentManagement from './AgentManagement';
import AgentProfile from './AgentProfile';
import Login from './Login';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { isAuthenticated, isStaff, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  if (!isStaff) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />

      <main className="pt-16 pl-64 min-h-screen">
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              <Route path="/dashboard/analytics" element={<Analytics />} />
              <Route path="/dashboard/agents" element={<AgentManagement />} />
              <Route path="/dashboard/agents/:id" element={<AgentProfile />} />
              <Route path="/" element={<Navigate to="/dashboard/analytics" replace />} />
            </Routes>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
