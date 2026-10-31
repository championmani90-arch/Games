import React, { useState } from 'react';
import { Trophy, Medal, Flame } from 'lucide-react';
import { GameId, LeaderboardEntry, UserProfile } from '../types/game';
import { GAMES_CATALOG, SIMULATED_LEADERBOARD } from '../data/games';

interface LeaderboardViewProps {
  userProfile: UserProfile;
  onPlayGame: (gameId: GameId) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  userProfile,
  onPlayGame,
}) => {
  const [selectedGameId, setSelectedGameId] = useState<GameId>('neon-runner');

  const selectedGame = GAMES_CATALOG.find((g) => g.id === selectedGameId)!;
  const baseEntries = SIMULATED_LEADERBOARD[selectedGameId] || [];

  // Integrate user's score if available
  const userScore = userProfile.highScores[selectedGameId] || 0;
  const allEntries: LeaderboardEntry[] = [...baseEntries];

  if (userScore > 0) {
    allEntries.push({
      id: 'current-user',
      rank: 0,
      nickname: userProfile.nickname,
      avatar: userProfile.avatar,
      score: userScore,
      date: 'Aujourd\'hui',
      isUser: true,
    });
  }

  // Sort by score descending
  allEntries.sort((a, b) => b.score - a.score);
  allEntries.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>Classement Mondial & Communauté</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Tableau des Meilleurs Scores
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Comparez vos performances avec les joueurs de Ludix.
          </p>
        </div>

        <button
          onClick={() => onPlayGame(selectedGameId)}
          className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
        >
          <Flame className="w-4 h-4 fill-current" />
          Défier ce classement ({selectedGame.title})
        </button>
      </div>

      {/* Game Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {GAMES_CATALOG.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGameId(g.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              selectedGameId === g.id
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {g.title}
          </button>
        ))}
      </div>

      {/* Leaderboard Table Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={selectedGame.thumbnail}
              alt={selectedGame.title}
              className="w-12 h-9 object-cover rounded-lg border border-slate-700"
            />
            <div>
              <h3 className="text-base font-bold text-white">{selectedGame.title}</h3>
              <p className="text-xs text-slate-400">{selectedGame.subtitle}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-500">Votre record actuel</span>
            <p className="font-mono tabular-nums text-sm font-bold text-emerald-400">
              {userScore > 0 ? `${userScore} pts` : 'Pas encore de score'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/80 text-slate-400 text-xs font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 sm:px-6 w-16">Rang</th>
                <th className="py-3.5 px-4">Joueur</th>
                <th className="py-3.5 px-4 hidden sm:table-cell">Date</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {allEntries.map((entry) => {
                const isTop1 = entry.rank === 1;
                const isTop2 = entry.rank === 2;
                const isTop3 = entry.rank === 3;

                return (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${
                      entry.isUser
                        ? 'bg-cyan-500/10 font-bold border-l-2 border-l-cyan-400'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-1.5 font-mono tabular-nums">
                        {isTop1 ? (
                          <span className="text-amber-400 flex items-center gap-1">
                            <Trophy className="w-4 h-4 fill-amber-400" /> 1
                          </span>
                        ) : isTop2 ? (
                          <span className="text-slate-300 flex items-center gap-1">
                            <Medal className="w-4 h-4" /> 2
                          </span>
                        ) : isTop3 ? (
                          <span className="text-amber-600 flex items-center gap-1">
                            <Medal className="w-4 h-4" /> 3
                          </span>
                        ) : (
                          <span className="text-slate-500 pl-1">{entry.rank}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg leading-none">{entry.avatar}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">
                              {entry.nickname}
                            </span>
                            {entry.isUser && (
                              <span className="text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-1.5 py-0.2 rounded font-normal">
                                Vous
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-400 hidden sm:table-cell">
                      {entry.date}
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-right font-mono tabular-nums text-base font-bold text-cyan-400">
                      {entry.score.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
