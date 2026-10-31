import React, { useState } from 'react';
import { ArrowLeft, Maximize2, Minimize2, Info, Star, Share2 } from 'lucide-react';
import { GameInfo, UserProfile } from '../types/game';
import { NeonRunner } from '../games/NeonRunner';
import { BrickBreaker } from '../games/BrickBreaker';
import { Quantum2048 } from '../games/Quantum2048';
import { ChessAI } from '../games/ChessAI';
import { WordHunt } from '../games/WordHunt';

interface GameArenaProps {
  game: GameInfo;
  onBack: () => void;
  userProfile: UserProfile;
  onUpdateScore: (gameId: GameInfo['id'], score: number) => void;
  onRecordGamePlayed: (gameId: GameInfo['id'], score: number) => void;
}

export const GameArena: React.FC<GameArenaProps> = ({
  game,
  onBack,
  userProfile,
  onUpdateScore,
  onRecordGamePlayed,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [copied, setCopied] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderActiveGame = () => {
    const best = userProfile.highScores[game.id] || 0;

    switch (game.id) {
      case 'neon-runner':
        return (
          <NeonRunner
            bestScore={best}
            onScoreUpdate={(s) => onUpdateScore('neon-runner', s)}
            onGameOver={(s, dist) => onRecordGamePlayed('neon-runner', s)}
          />
        );
      case 'brick-breaker':
        return (
          <BrickBreaker
            bestScore={best}
            onScoreUpdate={(s) => onUpdateScore('brick-breaker', s)}
            onGameOver={(s, lvl) => onRecordGamePlayed('brick-breaker', s)}
          />
        );
      case 'quantum-2048':
        return (
          <Quantum2048
            bestScore={best}
            onScoreUpdate={(s) => onUpdateScore('quantum-2048', s)}
            onGameOver={(s, maxTile) => onRecordGamePlayed('quantum-2048', s)}
          />
        );
      case 'chess-ai':
        return (
          <ChessAI
            onScoreUpdate={(s) => onUpdateScore('chess-ai', s)}
            onGameOver={(winner) => onRecordGamePlayed('chess-ai', winner === 'white' ? 1000 : 200)}
          />
        );
      case 'word-hunt':
        return (
          <WordHunt
            bestScore={best}
            onScoreUpdate={(s) => onUpdateScore('word-hunt', s)}
            onGameOver={(won, attempts) => onRecordGamePlayed('word-hunt', won ? 100 : 10)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Navigation & Title Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au catalogue
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">
              {game.title}
            </h1>
            <p className="text-xs text-slate-400">
              {game.subtitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleShare}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copied ? 'Lien copié !' : 'Partager'}
          </button>

          <button
            onClick={() => setShowControls(!showControls)}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            Contrôles
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Mode plein écran"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="w-full flex justify-center mb-8">
        {renderActiveGame()}
      </div>

      {/* Game Details & Rules Section */}
      <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-slate-800/80">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white">À propos de ce jeu</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {game.description}
          </p>

          <div className="pt-2">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Fonctionnalités clés
            </h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {game.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300"
                >
                  <Star className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls cheatsheet */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl h-fit space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            Guide des commandes
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {game.controlsSummary}
          </p>
          <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800/80">
            Conseil : Activez le plein écran pour une immersion totale sans distraction.
          </div>
        </div>
      </div>
    </div>
  );
};
