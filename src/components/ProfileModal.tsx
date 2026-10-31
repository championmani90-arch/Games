import React, { useState } from 'react';
import { X, Check, Trophy, Sparkles } from 'lucide-react';
import { UserProfile } from '../types/game';
import { AVATAR_OPTIONS, GAMES_CATALOG } from '../data/games';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (updated: Partial<UserProfile>) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
}) => {
  const [nickname, setNickname] = useState(userProfile.nickname);
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile.avatar);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveProfile({
      nickname: nickname.trim() || 'Joueur1',
      avatar: selectedAvatar,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1 font-display">
          Profil Joueur
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Personnalisez votre pseudo et votre avatar de joueur.
        </p>

        {/* Pseudonym Input */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Pseudo de joueur
            </label>
            <input
              type="text"
              value={nickname}
              maxLength={18}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-cyan-500 font-medium"
              placeholder="Votre pseudo"
            />
          </div>

          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Choisir un avatar
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setSelectedAvatar(av)}
                  className={`h-11 rounded-xl text-xl flex items-center justify-center border transition-all ${
                    selectedAvatar === av
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-500/20 scale-105'
                      : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* High Scores Summary */}
        <div className="mb-6 p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Vos Meilleurs Scores
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {GAMES_CATALOG.map((g) => (
              <div key={g.id} className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 truncate max-w-[120px]">{g.title}</span>
                <span className="font-mono tabular-nums font-bold text-cyan-400">
                  {userProfile.highScores[g.id] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Check className="w-4 h-4" /> Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};
