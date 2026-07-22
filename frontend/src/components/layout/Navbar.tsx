import React, { useState } from 'react';
import { Search, Bell, Sparkles, User as UserIcon, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header
      className="h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 content-layer"
      style={{
        background: 'rgba(245, 248, 245, 0.90)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(196, 212, 201, 0.8)',
        boxShadow: '0 1px 8px rgba(74,99,85,0.07)'
      }}
    >
      {/* Left */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl transition-all md:hidden"
          style={{ background: 'rgba(90,145,120,0.1)', border: '1px solid rgba(196,212,201,0.8)', color: '#5A9178' }}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden sm:flex items-center">
          <Search className="w-4 h-4 absolute left-3" style={{ color: '#7A9B89' }} />
          <input
            type="text"
            placeholder="Search specs, RFQs, vendors or AI copilot..."
            className="pl-9 pr-12 py-2 w-64 md:w-80 text-xs rounded-xl glass-input"
          />
          <kbd
            className="absolute right-3 text-[10px] px-1.5 py-0.5 rounded font-mono"
            style={{
              background: 'rgba(90,145,120,0.1)',
              color: '#7A9B89',
              border: '1px solid rgba(196,212,201,0.8)'
            }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* AI Badge */}
        <div
          className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full badge-glow"
          style={{
            background: 'linear-gradient(135deg, rgba(90,145,120,0.15), rgba(203,216,210,0.3))',
            border: '1px solid rgba(90,145,120,0.35)'
          }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: '#4A8A6A' }} />
          <span
            className="text-xs font-semibold"
            style={{
              background: 'linear-gradient(90deg, #2D6B4A, #5A9178)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Gemini AI Active
          </span>
        </div>

        {/* Notification */}
        <button
          className="relative p-2 rounded-xl transition-all"
          style={{
            background: 'rgba(90,145,120,0.08)',
            border: '1px solid rgba(196,212,201,0.8)',
            color: '#5A9178'
          }}
        >
          <Bell className="w-4 h-4" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: '#4A8A6A', boxShadow: '0 0 5px rgba(74,138,106,0.7)' }}
          />
        </button>

        {/* User */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 p-1.5 rounded-xl transition-all"
            style={{
              background: showProfileMenu ? 'rgba(90,145,120,0.12)' : 'rgba(90,145,120,0.07)',
              border: '1px solid rgba(196,212,201,0.8)'
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
              style={{
                background: 'linear-gradient(135deg, #4A8A6A, #5A9178)',
                boxShadow: '0 0 10px rgba(74,138,106,0.3)'
              }}
            >
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-obsidian-text-primary leading-tight">
                {user?.full_name || 'User'}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#5A9178' }}>
                {user?.role || 'MEMBER'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 hidden md:block" style={{ color: '#7A9B89' }} />
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-52 rounded-2xl py-2 z-50"
              style={{
                background: 'rgba(245, 248, 245, 0.97)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(196,212,201,0.9)',
                boxShadow: '0 12px 40px rgba(74,99,85,0.15)'
              }}
            >
              <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(196,212,201,0.7)' }}>
                <p className="text-xs font-semibold text-obsidian-text-primary">{user?.full_name}</p>
                <p className="text-[11px] text-obsidian-text-muted truncate mt-0.5">{user?.email}</p>
              </div>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full text-left px-4 py-2.5 text-xs text-obsidian-text-secondary hover:text-obsidian-text-primary flex items-center space-x-2 transition-all"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Profile Settings</span>
              </button>
              <button
                onClick={() => { setShowProfileMenu(false); logout(); }}
                className="w-full text-left px-4 py-2.5 text-xs flex items-center space-x-2 transition-all"
                style={{ color: '#C0504A' }}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
