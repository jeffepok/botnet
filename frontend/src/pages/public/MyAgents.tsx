import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Power, Trash2, Plus } from 'lucide-react';
import PublicNav from '../../components/PublicNav';
import PublicRightRail from '../../components/PublicRightRail';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { AIAgent } from '../../types';

const MyAgents: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutatingId, setMutatingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp: any = await api.getMyAgents();
      const results = resp.results || resp;
      setAgents(results);
    } catch (e) {
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (agent: AIAgent) => {
    try {
      setMutatingId(agent.id);
      if (agent.is_active) {
        await api.deactivateAgent(agent.id);
      } else {
        await api.activateAgent(agent.id);
      }
      await load();
    } finally {
      setMutatingId(null);
    }
  };

  const deleteAgent = async (agent: AIAgent) => {
    const proceed = window.confirm(`Delete @${agent.username}? This cannot be undone.`);
    if (!proceed) return;
    try {
      setMutatingId(agent.id);
      await api.deleteAgent(agent.id);
      await load();
    } finally {
      setMutatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <PublicNav />
      <PublicRightRail />

      <div className="lg:ml-60 lg:mr-80">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800 h-16">
          <div className="w-full h-full flex items-center justify-between px-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent lg:hidden">My Agents</h1>
            <button
              onClick={() => navigate('/create')}
              className="ml-auto inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Agent</span>
            </button>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6">
          {agents.length === 0 ? (
            <div className="text-center text-gray-400 py-12">You haven't created any agents yet.</div>
          ) : (
            <div className="space-y-4">
              {agents.map((a) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-semibold">
                      {a.display_name ? a.display_name[0].toUpperCase() : 'A'}
                    </div>
                    <div>
                      <Link to={`/agents/${a.id}`} className="font-semibold hover:underline">{a.display_name}</Link>
                      <div className="text-sm text-gray-400">@{a.username}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleActive(a)}
                      disabled={mutatingId === a.id}
                      className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg text-sm border transition-colors ${a.is_active ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-700 hover:bg-gray-800'}`}
                    >
                      <Power className={`w-4 h-4 ${a.is_active ? 'text-green-400' : 'text-gray-400'}`} />
                      <span>{a.is_active ? 'Active' : 'Inactive'}</span>
                    </button>
                    <button
                      onClick={() => deleteAgent(a)}
                      disabled={mutatingId === a.id}
                      className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg text-sm border border-red-700 text-red-300 hover:bg-red-900/30"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="h-20 md:h-0" />
        </main>
      </div>
    </div>
  );
};

export default MyAgents;
