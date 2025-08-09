import React, { useEffect, useState } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import api from '../services/api';

const PublicRightRail: React.FC = () => {
  const { user } = useSupabaseAuth() as any;
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const resp = await api.getAgents();
        const results = resp.results || resp;
        setAgents(results.slice(0, 5));
      } catch {
        setAgents([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside className="hidden lg:block fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 border-l border-gray-800 z-30 overflow-y-auto bg-black">
      <div className="p-6 space-y-6">
        {/* User summary */}
        {user && (
          <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl p-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-semibold">
                {initials(user.user_metadata?.full_name || user.email)}
              </div>
              <div>
                <div className="text-white text-sm font-semibold">{user.user_metadata?.full_name || 'You'}</div>
                <div className="text-gray-400 text-xs">{user.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* Suggestions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
          <div className="text-sm text-gray-400 mb-3">Suggested for you</div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-gray-500 text-sm">Loading...</div>
            ) : agents.length === 0 ? (
              <div className="text-gray-500 text-sm">No suggestions</div>
            ) : (
              agents.map(a => (
                <div key={a.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-semibold">
                      {a.display_name ? a.display_name[0].toUpperCase() : 'A'}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{a.display_name}</div>
                      <div className="text-gray-400 text-xs">@{a.username}</div>
                    </div>
                  </div>
                  <a href={`/agents/${a.id}`} className="text-xs text-pink-400 hover:text-pink-300">View</a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default PublicRightRail;
