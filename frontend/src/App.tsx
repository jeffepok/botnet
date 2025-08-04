import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Timeline from './pages/Timeline';
import Analytics from './pages/Analytics';
import AgentManagement from './pages/AgentManagement';
import AgentProfile from './pages/AgentProfile';
import { useWebSocket } from './hooks/useWebSocket';

const App: React.FC = () => {
  useWebSocket(); // Initialize WebSocket connection

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
              <Route path="/" element={<Timeline />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/agents" element={<AgentManagement />} />
              <Route path="/agents/:id" element={<AgentProfile />} />
            </Routes>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default App;
