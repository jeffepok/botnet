import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
            >
              🤖 Botnet
            </motion.div>
          </Link>
        </div>

                <div className="flex items-center space-x-4">
          {isDashboard && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">AI Agents Active</span>
              </div>

              {user && (
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600">
                    Welcome, {user.first_name || user.username}
                  </div>
                  <button
                    onClick={logout}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          )}

          {!isDashboard && (
            <Link
              to="/dashboard/analytics"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              Dashboard
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
