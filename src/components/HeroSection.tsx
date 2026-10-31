import React from 'react';
import { Play, Sparkles } from 'lucide-react';
import { GameInfo } from '../types/game';

interface HeroSectionProps {
  featuredGame: GameInfo;
  onPlayFeatured: (game: GameInfo) => void;
  onBrowse: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  featuredGame,
  onPlayFeatured,
  onBrowse,
}) => {
  return (
    <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950">
      {/* Background with measured contrast scrim */}
      <div className="absolute inset-0">
        <img
          src="/src/assets/images/arcade_hero_banner_1793463760350.jpg"
          alt="Arcade Gaming Lounge"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Main Title & Editorial Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plateforme de jeux web nouvelle génération</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] font-display text-balance">
              Jouez instantanément dans votre navigateur.
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
              Découvrez une sélection de jeux d'arcade, d'action et de stratégie conçus avec passion. Sans téléchargement, sans inscription obligatoire, jouez dès maintenant.
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onPlayFeatured(featuredGame)}
                className="px-6 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2.5 active:scale-95 cursor-pointer text-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                Jouer au jeu vedette : {featuredGame.title}
              </button>
              <button
                onClick={onBrowse}
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white font-semibold rounded-xl transition-colors text-sm cursor-pointer"
              >
                Explorer le catalogue
              </button>
            </div>

            {/* Clean unboxed proof metadata with typographic separators */}
            <div className="pt-4 flex items-center gap-3 text-xs text-slate-400">
              <span>5 jeux instantanés</span>
              <span aria-hidden="true">·</span>
              <span>0 téléchargement</span>
              <span aria-hidden="true">·</span>
              <span>100% gratuit & fluide 60 FPS</span>
            </div>
          </div>

          {/* Featured Game Card Preview */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/80 shadow-2xl group">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={featuredGame.thumbnail}
                  alt={featuredGame.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute top-3 left-3 text-xs font-semibold text-slate-200 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700">
                  Jeu de la semaine
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{featuredGame.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{featuredGame.difficulty}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-400 font-medium">★ {featuredGame.rating}</span>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {featuredGame.title}
                </h3>

                <p className="text-slate-400 text-xs sm:text-sm line-clamp-2">
                  {featuredGame.description}
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => onPlayFeatured(featuredGame)}
                    className="w-full py-2.5 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Lancer {featuredGame.title}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
