import React from 'react';
import { Gamepad2, User, Trophy, Award, Flame } from 'lucide-react';
import { UserProfile } from '../types/game';

interface HeaderProps {
  activeTab: 'catalog' | 'leaderboard' | 'achievements' | 'profile';
  onSelectTab: (tab: 'catalog' | 'leaderboard' | 'achievements' | 'profile') => void;
  userProfile: UserProfile;
  onOpenProfile: () => void;
  onQuickPlay: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  userProfile,
  onOpenProfile,
  onQuickPlay,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element wordmark) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('catalog')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white font-display whitespace-nowrap">
              LUDIX
            </span>
          </button>
        </div>

        {/* Zone 2: 4 Clean Single-Line Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <button
            onClick={() => onSelectTab('catalog')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer ${
              activeTab === 'catalog' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Jeux
          </button>
          <button
            onClick={() => onSelectTab('leaderboard')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'leaderboard' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            <Trophy className="w-4 h-4" />
            Classement
          </button>
          <button
            onClick={() => onSelectTab('achievements')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'achievements' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            <Award className="w-4 h-4" />
            Quêtes & Succès
          </button>
          <button
            onClick={onOpenProfile}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            <User className="w-4 h-4" />
            Profil
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (User profile level / quick play) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs transition-colors"
          >
            <span className="text-base">{userProfile.avatar}</span>
            <div className="hidden sm:block text-left">
              <span className="font-bold text-slate-200 block truncate max-w-[90px]">
                {userProfile.nickname}
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                Niv. {userProfile.level} · {userProfile.xp} XP
              </span>
            </div>
          </button>

          <button
            onClick={onQuickPlay}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap shrink-0 flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            Partie Rapide
          </button>
        </div>
      </div>
    </header>
  );
};
