import React from 'react';
import { Award, CheckCircle2, Zap, Trophy, Bomb, Sparkles, Gamepad2 } from 'lucide-react';
import { Achievement, DailyQuest, UserProfile } from '../types/game';

interface AchievementsViewProps {
  userProfile: UserProfile;
  achievements: Achievement[];
  dailyQuests: DailyQuest[];
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  userProfile,
  achievements,
  dailyQuests,
}) => {
  const nextLevelXp = userProfile.level * 500;
  const currentProgressPercent = Math.min(100, Math.floor((userProfile.xp / nextLevelXp) * 100));

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Bomb':
        return <Bomb className="w-5 h-5 text-rose-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      default:
        return <Gamepad2 className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Level & XP Overview Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-3xl">
            {userProfile.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {userProfile.nickname}
              </h2>
              <span className="text-xs text-cyan-400 font-mono">
                Niveau {userProfile.level}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {userProfile.totalGamesPlayed} parties jouées · {userProfile.unlockedAchievements.length} trophées débloqués
            </p>
          </div>
        </div>

        {/* Progress bar to next level */}
        <div className="md:w-72 space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Progression du Niveau {userProfile.level}</span>
            <span className="font-mono text-cyan-400">{userProfile.xp} / {nextLevelXp} XP</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${currentProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily Quests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Missions Quotidiennes
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Renouvelées chaque jour à minuit. Gagnez de l'XP supplémentaire.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {dailyQuests.map((quest) => (
            <div
              key={quest.id}
              className={`p-4 rounded-xl border transition-all ${
                quest.completed
                  ? 'bg-slate-900/40 border-emerald-500/30'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-xs font-semibold text-slate-200">
                  {quest.title}
                </span>
                {quest.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <span className="text-[11px] font-mono font-bold text-amber-400 shrink-0">
                    +{quest.rewardXp} XP
                  </span>
                )}
              </div>

              <div className="space-y-1.5 mt-3">
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      quest.completed ? 'bg-emerald-400' : 'bg-cyan-500'
                    }`}
                    style={{
                      width: `${Math.min(100, (quest.current / quest.target) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>Progression</span>
                  <span>{quest.current} / {quest.target}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trophies & Achievements Showcase */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            Galerie des Succès
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Accomplissez des prouesses dans chaque jeu pour débloquer ces insignes.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            const isUnlocked = userProfile.unlockedAchievements.includes(ach.id);

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                  isUnlocked
                    ? 'bg-slate-900/90 border-slate-700 shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? 'bg-slate-800 border border-slate-700'
                      : 'bg-slate-900 border border-slate-800 text-slate-600'
                  }`}
                >
                  {getAchievementIcon(ach.icon)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs font-bold ${
                        isUnlocked ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {ach.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {ach.description}
                  </p>
                  <div className="pt-1 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <span>+{ach.xpReward} XP</span>
                    <span aria-hidden="true">·</span>
                    <span>{isUnlocked ? 'Débloqué' : 'Verrouillé'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
