import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, User, Bot } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface PublicNavProps {
  onCreate?: () => void; // Made optional since we're now using navigation
  onLoginRequired?: () => void;
}

const NavItem: React.FC<{ to?: string; active?: boolean; onClick?: () => void; icon: React.ReactNode; label: string }>
  = ({ to, active, onClick, icon, label }) => {
  const base = `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${active ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`;
  if (to) {
    return (
      <Link to={to} className={base}>
        {icon}
        <span className="font-medium">{label}</span>
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={base}>
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
};

const PublicNav: React.FC<PublicNavProps> = ({ onCreate, onLoginRequired }) => {
  const location = useLocation();
  const { user } = useSupabaseAuth();
  const isActive = (path: string) => location.pathname === path;

  const handleProfileClick = () => {
    if (!user && onLoginRequired) {
      onLoginRequired();
    }
  };

  return (
    <>
      {/* Desktop/Tablet left nav */}
      <aside className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-60 border-r border-gray-800 bg-black/80 backdrop-blur-md z-40 overflow-y-auto">
        <nav className="flex flex-col w-full pt-4 px-3 space-y-2">
          <div className="px-4 pb-2">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/botnet_logo.png" alt="Botnet" className="h-7 w-7" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Botnet</span>
            </Link>
          </div>
          <NavItem to="/" active={isActive('/')} icon={<Home className="w-5 h-5" />} label="Home" />
          <NavItem to="/create" active={isActive('/create')} icon={<PlusSquare className="w-5 h-5" />} label="Create" />
          {user && (
            <NavItem to="/my-agents" active={isActive('/my-agents')} icon={<Bot className="w-5 h-5" />} label="My Agents" />
          )}
          {user ? (
            <NavItem to="/me" active={isActive('/me')} icon={<User className="w-5 h-5" />} label="Profile" />
          ) : (
            <NavItem onClick={handleProfileClick} icon={<User className="w-5 h-5" />} label="Profile" />
          )}
          <div className="flex-1" />
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-black/90 backdrop-blur-md z-40">
        <div className="grid grid-cols-3">
          <Link to="/" className={`flex flex-col items-center py-3 ${isActive('/') ? 'text-white' : 'text-gray-300'}`}>
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/create" className={`flex flex-col items-center py-3 ${isActive('/create') ? 'text-white' : 'text-gray-300'}`}>
            <PlusSquare className="w-6 h-6" />
            <span className="text-xs mt-1">Create</span>
          </Link>
          {user && (
            <Link to="/my-agents" className={`flex flex-col items-center py-3 ${isActive('/my-agents') ? 'text-white' : 'text-gray-300'}`}>
              <Bot className="w-6 h-6" />
              <span className="text-xs mt-1">My Agents</span>
            </Link>
          )}
          {user ? (
            <Link to="/me" className={`flex flex-col items-center py-3 ${isActive('/me') ? 'text-white' : 'text-gray-300'}`}>
              <User className="w-6 h-6" />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          ) : (
            <button onClick={handleProfileClick} className="flex flex-col items-center py-3 text-gray-300 hover:text-white">
              <User className="w-6 h-6" />
              <span className="text-xs mt-1">Profile</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
};

export default PublicNav;
