import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { GameCatalog } from './components/GameCatalog';
import { GameArena } from './components/GameArena';
import { LeaderboardView } from './components/LeaderboardView';
import { AchievementsView } from './components/AchievementsView';
import { ProfileModal } from './components/ProfileModal';
import { Footer } from './components/Footer';
import { GAMES_CATALOG, INITIAL_ACHIEVEMENTS, INITIAL_DAILY_QUESTS } from './data/games';
import { GameInfo, UserProfile, Achievement, DailyQuest } from './types/game';
import { sounds } from './utils/audio';
import { Trophy, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'ludix_user_profile_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'leaderboard' | 'achievements' | 'profile'>('catalog');
  const [activeGame, setActiveGame] = useState<GameInfo | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize or load profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      nickname: 'CyberGamer',
      avatar: '⚡',
      level: 1,
      xp: 150,
      highScores: {
        'neon-runner': 680,
        'brick-breaker': 1240,
        'quantum-2048': 2048,
        'chess-ai': 0,
        'word-hunt': 2,
      },
      unlockedAchievements: ['first_play'],
      totalGamesPlayed: 3,
    };
  });

  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(INITIAL_DAILY_QUESTS);

  // Persist profile
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userProfile));
    } catch {
      // ignore
    }
  }, [userProfile]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4000);
  }, []);

  const addXp = useCallback(
    (amount: number) => {
      setUserProfile((prev) => {
        const nextXp = prev.xp + amount;
        const currentReq = prev.level * 500;
        let nextLevel = prev.level;
        if (nextXp >= currentReq) {
          nextLevel += 1;
          sounds.playVictory();
          showToast(`Niveau supérieur atteint ! Vous êtes maintenant Niveau ${nextLevel} 🏆`);
        }
        return {
          ...prev,
          xp: nextXp,
          level: nextLevel,
        };
      });
    },
    [showToast]
  );

  const unlockAchievement = useCallback(
    (achId: string) => {
      setUserProfile((prev) => {
        if (prev.unlockedAchievements.includes(achId)) return prev;
        const target = achievements.find((a) => a.id === achId);
        if (target) {
          sounds.playPowerup();
          showToast(`Succès Débloqué : ${target.title} (+${target.xpReward} XP) 🎖️`);
          addXp(target.xpReward);
        }
        return {
          ...prev,
          unlockedAchievements: [...prev.unlockedAchievements, achId],
        };
      });
    },
    [achievements, addXp, showToast]
  );

  const handleUpdateScore = useCallback(
    (gameId: GameInfo['id'], score: number) => {
      setUserProfile((prev) => {
        const currentBest = prev.highScores[gameId] || 0;
        if (score > currentBest) {
          return {
            ...prev,
            highScores: {
              ...prev.highScores,
              [gameId]: score,
            },
          };
        }
        return prev;
      });

      // Check achievement conditions based on score
      if (gameId === 'neon-runner' && score >= 500) {
        unlockAchievement('runner_distance');
      }
      if (gameId === 'brick-breaker' && score >= 2000) {
        unlockAchievement('brick_master');
      }
      if (gameId === 'quantum-2048' && score >= 1024) {
        unlockAchievement('puzzle_1024');
      }
      if (gameId === 'chess-ai' && score >= 1000) {
        unlockAchievement('chess_victory');
      }
    },
    [unlockAchievement]
  );

  const handleRecordGamePlayed = useCallback(
    (gameId: GameInfo['id'], score: number) => {
      setUserProfile((prev) => ({
        ...prev,
        totalGamesPlayed: prev.totalGamesPlayed + 1,
      }));
      addXp(40);
      unlockAchievement('first_play');

      // Update quests
      setDailyQuests((prev) =>
        prev.map((q) => {
          if (q.gameId === gameId && !q.completed) {
            const nextCur = q.current + score;
            const completed = nextCur >= q.target;
            if (completed) {
              sounds.playVictory();
              showToast(`Quête terminée : ${q.title} (+${q.rewardXp} XP) ✨`);
              addXp(q.rewardXp);
            }
            return {
              ...q,
              current: Math.min(q.target, nextCur),
              completed,
            };
          }
          return q;
        })
      );
    },
    [addXp, showToast, unlockAchievement]
  );

  const handleSelectGame = (game: GameInfo) => {
    setActiveGame(game);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickPlay = () => {
    const randomGame = GAMES_CATALOG[Math.floor(Math.random() * GAMES_CATALOG.length)];
    handleSelectGame(randomGame);
  };

  const handleSaveProfile = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updated }));
    showToast('Profil mis à jour avec succès !');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-xl bg-slate-900 border border-cyan-500/50 text-white shadow-2xl flex items-center gap-3 animate-fade-in text-xs sm:text-sm">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 animate-spin" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header conforming to 3-zone contract */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setActiveGame(null);
        }}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileOpen(true)}
        onQuickPlay={handleQuickPlay}
      />

      <main className="flex-1">
        {/* If user is actively playing a game in Arena */}
        {activeGame ? (
          <GameArena
            game={activeGame}
            userProfile={userProfile}
            onBack={() => setActiveGame(null)}
            onUpdateScore={handleUpdateScore}
            onRecordGamePlayed={handleRecordGamePlayed}
          />
        ) : (
          <>
            {activeTab === 'catalog' && (
              <>
                <HeroSection
                  featuredGame={GAMES_CATALOG[0]}
                  onPlayFeatured={handleSelectGame}
                  onBrowse={() => {
                    const el = document.getElementById('catalog');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
                <GameCatalog
                  games={GAMES_CATALOG}
                  onSelectGame={handleSelectGame}
                  userHighScores={userProfile.highScores}
                />
              </>
            )}

            {activeTab === 'leaderboard' && (
              <LeaderboardView
                userProfile={userProfile}
                onPlayGame={(gameId) => {
                  const target = GAMES_CATALOG.find((g) => g.id === gameId);
                  if (target) handleSelectGame(target);
                }}
              />
            )}

            {activeTab === 'achievements' && (
              <AchievementsView
                userProfile={userProfile}
                achievements={achievements}
                dailyQuests={dailyQuests}
              />
            )}
          </>
        )}
      </main>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Footer */}
      <Footer
        onOpenProfile={() => setIsProfileOpen(true)}
      />
    </div>
  );
}
