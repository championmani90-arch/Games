import React from 'react';
import { Gamepad2, Heart } from 'lucide-react';

interface FooterProps {
  onSelectCategory?: (cat: string) => void;
  onOpenProfile: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenProfile }) => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white font-display">LUDIX</span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
              La plateforme de jeux web instantanés, sans latence et sans publicité intrusive. Développé pour offrir un divertissement immédiat sur tous les écrans.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-2.5">
            <h4 className="text-slate-200 font-bold text-xs uppercase tracking-wider">
              Jeux Populaires
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>Cyber Runner 2D</li>
              <li>Casse-Briques Nova</li>
              <li>Quantum 2048</li>
              <li>Échecs vs IA</li>
              <li>Mot Mystère FR</li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-2.5">
            <h4 className="text-slate-200 font-bold text-xs uppercase tracking-wider">
              Communauté
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button
                  onClick={onOpenProfile}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Personnaliser mon profil
                </button>
              </li>
              <li>Sauvegarde locale automatique</li>
              <li>Web Audio Haute Précision</li>
              <li>Compatible Mobile & Clavier</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} LUDIX. Tous droits réservés.</p>
          <p className="flex items-center gap-1">
            Fait avec <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> pour les passionnés de jeux vidéo
          </p>
        </div>
      </div>
    </footer>
  );
};
