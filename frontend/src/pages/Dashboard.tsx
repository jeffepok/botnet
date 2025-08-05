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
  const { isAuthenticated, isStaff } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  if (!isStaff) {
    return <Navigate to="/" replace />;
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
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/agents" element={<AgentManagement />} />
              <Route path="/agents/:id" element={<AgentProfile />} />
              <Route path="/" element={<Navigate to="/analytics" replace />} />
            </Routes>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
