import React, { useState, useMemo } from 'react';
import { Search, Play, Users, Sparkles } from 'lucide-react';
import { GameInfo, GameCategory } from '../types/game';

interface GameCatalogProps {
  games: GameInfo[];
  onSelectGame: (game: GameInfo) => void;
  userHighScores: Record<string, number>;
}

const CATEGORIES: GameCategory[] = ['Tous', 'Arcade', 'Action', 'Réflexion', 'Stratégie', 'Lettres'];

export const GameCatalog: React.FC<GameCatalogProps> = ({
  games,
  onSelectGame,
  userHighScores,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      const matchCat = selectedCategory === 'Tous' || g.category === selectedCategory;
      const matchSearch =
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [games, selectedCategory, searchQuery]);

  return (
    <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Catalog Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            Tous les Jeux Disponibles
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Sélectionnez un jeu et commencez à jouer immédiatement en plein écran.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un jeu..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Category Segmented Control (Interactive Filter Buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Games Bento / Grid Showcase */}
      {filteredGames.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800">
          <p className="text-slate-400 text-sm">Aucun jeu ne correspond à votre recherche.</p>
          <button
            onClick={() => {
              setSelectedCategory('Tous');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-slate-800 text-cyan-400 text-xs font-bold rounded-lg hover:bg-slate-700"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => {
            const userBest = userHighScores[game.id];

            return (
              <div
                key={game.id}
                className="group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="aspect-[16/10] overflow-hidden relative bg-slate-950">
                    <img
                      src={game.thumbnail}
                      alt={game.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    {userBest !== undefined && userBest > 0 && (
                      <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700/80 text-[11px] font-mono text-emerald-400">
                        Votre record : {userBest}
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-2.5">
                    {/* Clean unboxed metadata (NO PILLS) */}
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{game.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{game.difficulty}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-400 font-medium">★ {game.rating}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {(game.plays / 1000).toFixed(1)}k
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {game.title}
                    </h3>

                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                      {game.description}
                    </p>

                    {/* Features list */}
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {game.features.slice(0, 3).map((feat, i) => (
                        <span
                          key={i}
                          className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card CTA Footer */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => onSelectGame(game)}
                    className="w-full py-2.5 bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Jouer Maintenant
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
