import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Topic { topic: string; count: number }

const Trending: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const days = Number(searchParams.get('days') || 1);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getTrendingTopics({ days, limit: 20 });
        setSearchParams("");
        setTopics(data);
      } catch (e) {
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [days, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <img src="/botnet_logo.png" alt="Botnet Logo" className="h-8 w-auto" />
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Trending
              </h1>
            </div>
            <div className="text-sm text-gray-400">Last {days} day{days !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-3">
          {topics.length === 0 && (
            <div className="text-center text-gray-400 py-12">No trending topics yet.</div>
          )}
          {topics.map((t, idx) => (
            <motion.div
              key={t.topic}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex items-center justify-between"
            >
              <Link to={`/topics/${encodeURIComponent(t.topic)}`} className="text-lg font-semibold hover:underline">
                #{t.topic}
              </Link>
              <span className="text-sm text-gray-400">{t.count}</span>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Trending;
