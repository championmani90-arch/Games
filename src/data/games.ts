import { GameInfo, Achievement, DailyQuest, LeaderboardEntry, GameId } from '../types/game';

export const GAMES_CATALOG: GameInfo[] = [
  {
    id: 'neon-runner',
    title: 'Cyber Runner',
    subtitle: 'Course d\'obstacles sur les toits néons',
    category: 'Arcade',
    description: 'Foncez sur les toits de Néo-Tokyo, esquivez les barrières lasers, collectez les orbes énergétiques et enchaînez les combos à vitesse vertigineuse.',
    thumbnail: '/src/assets/images/game_neon_runner_1793463761017.jpg',
    rating: 4.9,
    plays: 38420,
    controlsSummary: 'Espace / ↑ pour sauter (double saut), ↓ pour glisser',
    features: ['Double saut & glissade', 'Combos multiplicateurs', 'Vitesse progressive', 'Effets néon dynamiques'],
    difficulty: 'Tous niveaux'
  },
  {
    id: 'brick-breaker',
    title: 'Casse-Briques Nova',
    subtitle: 'Arcade spatiale explosive',
    category: 'Action',
    description: 'Détruisez les boucliers et blocs dimensionnels avec votre balle à haute vélocité. Récupérez les bonus multi-balles, lasers et élargisseurs de raquette.',
    thumbnail: '/src/assets/images/game_brick_breaker_1793463762613.jpg',
    rating: 4.8,
    plays: 29810,
    controlsSummary: 'Souris / Doigt ou ← → pour diriger la raquette, Espace pour lancer/tirer',
    features: ['Blocs blindés & explosifs', 'Bonus lasers & multi-balles', '3 niveaux dynamiques', 'Physique d\'angle précise'],
    difficulty: 'Moyen'
  },
  {
    id: 'quantum-2048',
    title: 'Quantum 2048',
    subtitle: 'Casse-tête mathématique évolué',
    category: 'Réflexion',
    description: 'Glissez et fusionnez les cellules quantiques pour atteindre 2048 et au-delà. Modes 4x4 classique, 3x3 blitz ou 5x5 infini avec fonction annuler.',
    thumbnail: '/src/assets/images/game_quantum_2048_1793463762968.jpg',
    rating: 4.9,
    plays: 45190,
    controlsSummary: 'Flèches du clavier, ZQSD ou glisser sur l\'écran',
    features: ['Bouton Annuler (Undo)', 'Modes 3x3, 4x4 et 5x5', 'Animations de fusion fluides', 'Sauvegarde automatique'],
    difficulty: 'Tous niveaux'
  },
  {
    id: 'chess-ai',
    title: 'Échecs Grand Maître',
    subtitle: 'Duel d\'esprit contre l\'IA ou à deux',
    category: 'Stratégie',
    description: 'Affrontez une intelligence artificielle à 3 paliers de difficulté ou jouez en duel local. Affichage des coups légaux, historique et prise de pièces.',
    thumbnail: '/src/assets/images/game_chess_ai_1793463763500.jpg',
    rating: 4.9,
    plays: 21450,
    controlsSummary: 'Clic ou glisser-déposer sur les cases',
    features: ['IA à 3 niveaux (Débutant, Expert, Grand Maître)', 'Mode 2 joueurs local', 'Calcul d\'échec et mat', 'Historique des coups'],
    difficulty: 'Difficile'
  },
  {
    id: 'word-hunt',
    title: 'Mot Mystère FR',
    subtitle: 'Le défi quotidien des lettres',
    category: 'Lettres',
    description: 'Devinez le mot secret français en 6 essais avec des indices de couleur. Jouez au mot du jour ou lancez des parties illimitées pour tester votre vocabulaire.',
    thumbnail: '/src/assets/images/game_quantum_2048_1793463762968.jpg',
    rating: 4.7,
    plays: 33700,
    controlsSummary: 'Clavier physique ou clavier virtuel interactif',
    features: ['Dictionnaire français validé', 'Indices progressifs', 'Parties illimitées ou mot du jour', 'Statistiques de victoires'],
    difficulty: 'Moyen'
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_play',
    title: 'Premier pas dans l\'Arène',
    description: 'Lancer votre toute première partie sur la plateforme.',
    category: 'Général',
    icon: 'Gamepad2',
    xpReward: 100,
    unlocked: false
  },
  {
    id: 'runner_distance',
    title: 'Foulée Supersonique',
    description: 'Parcourir plus de 500 mètres en une seule course de Cyber Runner.',
    category: 'Arcade',
    icon: 'Zap',
    xpReward: 250,
    unlocked: false
  },
  {
    id: 'brick_master',
    title: 'Briseur d\'Orbitales',
    description: 'Atteindre un score de 2 000 points au Casse-Briques Nova.',
    category: 'Arcade',
    icon: 'Bomb',
    xpReward: 250,
    unlocked: false
  },
  {
    id: 'puzzle_1024',
    title: 'Maître Quantique',
    description: 'Créer une tuile 1024 ou plus dans Quantum 2048.',
    category: 'Stratégie',
    icon: 'Sparkles',
    xpReward: 300,
    unlocked: false
  },
  {
    id: 'chess_victory',
    title: 'Échec et Mat',
    description: 'Remporter une partie d\'échecs contre l\'ordinateur.',
    category: 'Stratégie',
    icon: 'Trophy',
    xpReward: 400,
    unlocked: false
  },
  {
    id: 'word_streak',
    title: 'Linguiste Aiguisé',
    description: 'Trouver un Mot Mystère en 3 essais ou moins.',
    category: 'Exploit',
    icon: 'Award',
    xpReward: 200,
    unlocked: false
  }
];

export const INITIAL_DAILY_QUESTS: DailyQuest[] = [
  {
    id: 'quest_runner_300',
    title: 'Parcourir 300m dans Cyber Runner',
    gameId: 'neon-runner',
    target: 300,
    current: 0,
    rewardXp: 150,
    completed: false
  },
  {
    id: 'quest_brick_1000',
    title: 'Marquer 1 000 pts au Casse-Briques',
    gameId: 'brick-breaker',
    target: 1000,
    current: 0,
    rewardXp: 150,
    completed: false
  },
  {
    id: 'quest_2048_merge',
    title: 'Fusionner une tuile 256 dans 2048',
    gameId: 'quantum-2048',
    target: 256,
    current: 0,
    rewardXp: 200,
    completed: false
  }
];

export const SIMULATED_LEADERBOARD: Record<GameId, LeaderboardEntry[]> = {
  'neon-runner': [
    { id: '1', rank: 1, nickname: 'NéoKira', avatar: '⚡', score: 2840, date: 'Aujourd\'hui' },
    { id: '2', rank: 2, nickname: 'CyberViper', avatar: '👾', score: 2410, date: 'Hier' },
    { id: '3', rank: 3, nickname: 'GhostBlade', avatar: '🗡️', score: 2090, date: 'Hier' },
    { id: '4', rank: 4, nickname: 'PixelQueen', avatar: '👑', score: 1850, date: 'Il y a 2j' },
    { id: '5', rank: 5, nickname: 'AstroNova', avatar: '🚀', score: 1620, date: 'Il y a 3j' },
  ],
  'brick-breaker': [
    { id: '1', rank: 1, nickname: 'VortexPilot', avatar: '☄️', score: 6240, date: 'Aujourd\'hui' },
    { id: '2', rank: 2, nickname: 'RetroMax', avatar: '🕹️', score: 5410, date: 'Aujourd\'hui' },
    { id: '3', rank: 3, nickname: 'LaserPulse', avatar: '⚡', score: 4890, date: 'Hier' },
    { id: '4', rank: 4, nickname: 'ShieldMaster', avatar: '🛡️', score: 4200, date: 'Il y a 2j' },
    { id: '5', rank: 5, nickname: 'CosmoKat', avatar: '🐱', score: 3880, date: 'Il y a 4j' },
  ],
  'quantum-2048': [
    { id: '1', rank: 1, nickname: 'MathGenius', avatar: '🧠', score: 28440, date: 'Aujourd\'hui' },
    { id: '2', rank: 2, nickname: 'HexaLord', avatar: '💠', score: 22180, date: 'Hier' },
    { id: '3', rank: 3, nickname: 'ZenMaster', avatar: '☯️', score: 18920, date: 'Hier' },
    { id: '4', rank: 4, nickname: 'InfinityFlux', avatar: '🌌', score: 14660, date: 'Il y a 2j' },
    { id: '5', rank: 5, nickname: 'LogicPrime', avatar: '🔢', score: 11200, date: 'Il y a 3j' },
  ],
  'chess-ai': [
    { id: '1', rank: 1, nickname: 'GrandMasterLeo', avatar: '👑', score: 1850, date: 'Aujourd\'hui' },
    { id: '2', rank: 2, nickname: 'TacticalFox', avatar: '🦊', score: 1620, date: 'Aujourd\'hui' },
    { id: '3', rank: 3, nickname: 'KasparovFan', avatar: '♟️', score: 1480, date: 'Hier' },
    { id: '4', rank: 4, nickname: 'DeepGambit', avatar: '🤖', score: 1350, date: 'Il y a 2j' },
    { id: '5', rank: 5, nickname: 'BishopSniper', avatar: '🎯', score: 1210, date: 'Il y a 3j' },
  ],
  'word-hunt': [
    { id: '1', rank: 1, nickname: 'LexiqueRoi', avatar: '📚', score: 14, date: 'Aujourd\'hui' }, // série de victoires
    { id: '2', rank: 2, nickname: 'PlumeDorée', avatar: '🪶', score: 11, date: 'Hier' },
    { id: '3', rank: 3, nickname: 'MotsFléchés99', avatar: '🖋️', score: 9, date: 'Hier' },
    { id: '4', rank: 4, nickname: 'SyllabePro', avatar: '✨', score: 7, date: 'Il y a 2j' },
    { id: '5', rank: 5, nickname: 'AlphabetHero', avatar: '🔤', score: 5, date: 'Il y a 3j' },
  ]
};

export const AVATAR_OPTIONS = ['🎮', '⚡', '👾', '🚀', '👑', '🦊', '🐱', '🔥', '🛡️', '🧠', '🌌', '🎯'];
