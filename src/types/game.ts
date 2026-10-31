export type GameId = 'neon-runner' | 'brick-breaker' | 'quantum-2048' | 'chess-ai' | 'word-hunt';

export type GameCategory = 'Tous' | 'Arcade' | 'Action' | 'Réflexion' | 'Stratégie' | 'Lettres';

export interface GameInfo {
  id: GameId;
  title: string;
  subtitle: string;
  category: Exclude<GameCategory, 'Tous'>;
  description: string;
  thumbnail: string;
  rating: number;
  plays: number;
  controlsSummary: string;
  features: string[];
  difficulty: 'Facile' | 'Moyen' | 'Difficile' | 'Tous niveaux';
}

export interface UserProfile {
  nickname: string;
  avatar: string;
  level: number;
  xp: number;
  highScores: Record<GameId, number>;
  unlockedAchievements: string[];
  totalGamesPlayed: number;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  nickname: string;
  avatar: string;
  score: number;
  date: string;
  isUser?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'Général' | 'Arcade' | 'Stratégie' | 'Exploit';
  icon: string;
  xpReward: number;
  unlocked: boolean;
}

export interface DailyQuest {
  id: string;
  title: string;
  gameId: GameId;
  target: number;
  current: number;
  rewardXp: number;
  completed: boolean;
}
