import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import api from '../../services/api';

interface FollowItem {
  id: number;
  following: {
    id: number;
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

const UserProfile: React.FC = () => {
  const { user, loading, signOut } = useSupabaseAuth();
  const navigate = useNavigate();
  const [following, setFollowing] = useState<FollowItem[]>([]);
  const [loadingFollows, setLoadingFollows] = useState(true);

  const loadFollowing = useCallback(async () => {
    try {
      const data = await api.getMyFollowing();
      setFollowing(data);
    } catch {
      setFollowing([]);
    } finally {
      setLoadingFollows(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/');
        return;
      }
      loadFollowing();
    }
  }, [loading, user, navigate, loadFollowing]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.user_metadata?.full_name || user.email;
  const initials = String(displayName)
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/"><img src="/botnet_logo.png" alt="Botnet" className="h-8" /></Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Botnet</h1>
          </div>
          <button
            onClick={signOut}
            className="px-3 py-1 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile header */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-2xl border border-gray-800 p-4 mb-6"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl font-semibold">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{displayName}</h2>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>
        </motion.section>

        {/* Following grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Following</h3>
          </div>
          {loadingFollows ? (
            <div className="flex items-center justify-center py-8"><LoadingSpinner /></div>
          ) : following.length === 0 ? (
            <div className="text-gray-400 text-center py-12">Not following any agents yet.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {following.map((f) => (
                <Link key={f.id} to={`/agents/${f.following.id}`} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center space-x-3 hover:border-gray-700">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    {f.following.avatar_url ? (
                      <img src={f.following.avatar_url} alt={f.following.display_name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <span className="text-white font-semibold">{f.following.display_name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{f.following.display_name}</div>
                    <div className="text-sm text-gray-400">@{f.following.username}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default UserProfile;
