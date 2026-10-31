import React, { useState, useEffect, useCallback } from 'react';
import { sounds } from '../utils/audio';
import { RotateCcw, HelpCircle, Volume2, VolumeX, Sparkles, Trophy } from 'lucide-react';

interface WordHuntProps {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (won: boolean, attempts: number) => void;
  bestScore?: number;
}

const FRENCH_WORDS_5 = [
  'TABLE', 'PORTE', 'MONDE', 'ROCHE', 'JOUER', 'FLASH', 'VAGUE', 'ASTRE',
  'NUAGE', 'OMBRE', 'FORGE', 'LIVRE', 'PLAGE', 'ETOILE', 'COEUR', 'FLAMME',
  'BRUME', 'ROUTE', 'CHAMP', 'CHANT', 'FLEUR', 'GLACE', 'HERBE', 'IMAGE',
  'LUCIO', 'MAGIE', 'NAVRE', 'OCEAN', 'POEME', 'QUART', 'RAYON', 'SONGE',
  'TEMPS', 'USINE', 'VOILE', 'ZEBRE', 'BARRE', 'CABLE', 'DANSE', 'ECLAT'
];

type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

const KEYBOARD_ROWS = [
  ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
  ['ENTER', 'W', 'X', 'C', 'V', 'B', 'N', 'BACKSPACE']
];

export const WordHunt: React.FC<WordHuntProps> = ({
  onScoreUpdate,
  onGameOver,
  bestScore = 0
}) => {
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');
  const [streak, setStreak] = useState(bestScore);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [isMuted, setIsMuted] = useState(sounds.isMuted());

  const maxAttempts = 6;
  const wordLength = 5;

  const toggleMute = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  const pickNewWord = useCallback(() => {
    const word = FRENCH_WORDS_5[Math.floor(Math.random() * FRENCH_WORDS_5.length)];
    setTargetWord(word.slice(0, wordLength).toUpperCase());
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('PLAYING');
    setHintsUsed(0);
    setRevealedIndices([]);
  }, []);

  useEffect(() => {
    pickNewWord();
  }, [pickNewWord]);

  // Evaluates letter colors for a guess
  const evaluateGuess = (guess: string, target: string): LetterStatus[] => {
    const result: LetterStatus[] = Array(wordLength).fill('absent');
    const targetArr = target.split('');
    const guessArr = guess.split('');

    // First pass: correct positions
    for (let i = 0; i < wordLength; i++) {
      if (guessArr[i] === targetArr[i]) {
        result[i] = 'correct';
        targetArr[i] = '#';
      }
    }

    // Second pass: present but misplaced
    for (let i = 0; i < wordLength; i++) {
      if (result[i] !== 'correct') {
        const foundIdx = targetArr.indexOf(guessArr[i]);
        if (foundIdx !== -1) {
          result[i] = 'present';
          targetArr[foundIdx] = '#';
        }
      }
    }

    return result;
  };

  // Keyboard letter color map
  const getLetterStatuses = () => {
    const map: Record<string, LetterStatus> = {};
    guesses.forEach((g) => {
      const statuses = evaluateGuess(g, targetWord);
      g.split('').forEach((letter, i) => {
        const current = map[letter];
        const evaluated = statuses[i];
        if (evaluated === 'correct') {
          map[letter] = 'correct';
        } else if (evaluated === 'present' && current !== 'correct') {
          map[letter] = 'present';
        } else if (!current) {
          map[letter] = evaluated;
        }
      });
    });
    return map;
  };

  const letterStatuses = getLetterStatuses();

  const handleCharInput = useCallback((char: string) => {
    if (gameStatus !== 'PLAYING') return;

    if (char === 'BACKSPACE') {
      sounds.playChessMove();
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (char === 'ENTER') {
      if (currentGuess.length !== wordLength) {
        sounds.playHit();
        return;
      }

      sounds.playScore();
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');

      if (currentGuess === targetWord) {
        setGameStatus('WON');
        sounds.playVictory();
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (onScoreUpdate) onScoreUpdate(newStreak);
        if (onGameOver) onGameOver(true, newGuesses.length);
      } else if (newGuesses.length >= maxAttempts) {
        setGameStatus('LOST');
        sounds.playGameOver();
        setStreak(0);
        if (onGameOver) onGameOver(false, maxAttempts);
      }
    } else if (/^[A-Z]$/.test(char) && currentGuess.length < wordLength) {
      sounds.playBounce(1.5);
      setCurrentGuess((prev) => prev + char);
    }
  }, [currentGuess, gameStatus, guesses, onGameOver, onScoreUpdate, streak, targetWord]);

  // Handle keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        handleCharInput('BACKSPACE');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleCharInput('ENTER');
      } else {
        const upper = e.key.toUpperCase();
        if (/^[A-Z]$/.test(upper)) {
          handleCharInput(upper);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCharInput]);

  // Hint feature: reveals one unrevealed correct letter
  const useHint = () => {
    if (gameStatus !== 'PLAYING' || hintsUsed >= 2) return;
    const unrevealed = [];
    for (let i = 0; i < wordLength; i++) {
      if (!revealedIndices.includes(i)) unrevealed.push(i);
    }
    if (unrevealed.length > 0) {
      const pick = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      setRevealedIndices((prev) => [...prev, pick]);
      setHintsUsed((prev) => prev + 1);
      sounds.playPowerup();
    }
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-lg mx-auto">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-t-xl text-xs sm:text-sm">
        <div className="flex items-center gap-4 text-slate-300">
          <div>
            <span className="text-slate-500 font-medium">Essais</span>
            <p className="font-mono tabular-nums text-base sm:text-lg font-bold text-white">
              {guesses.length} / {maxAttempts}
            </p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Série de victoires</span>
            <p className="font-mono tabular-nums text-base sm:text-lg font-bold text-cyan-400">
              {streak} 🔥
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={useHint}
            disabled={hintsUsed >= 2 || gameStatus !== 'PLAYING'}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-amber-400 border border-slate-700 hover:bg-slate-700 disabled:opacity-40 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Indice ({2 - hintsUsed})
          </button>

          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="w-full bg-slate-950 border-x border-slate-800 p-4 sm:p-6 flex flex-col items-center gap-2">
        {revealedIndices.length > 0 && (
          <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-md mb-2">
            Lettre révélée : {revealedIndices.map((idx) => `${idx + 1}e lettre = "${targetWord[idx]}"`).join(', ')}
          </div>
        )}

        {Array.from({ length: maxAttempts }).map((_, rowIndex) => {
          const isSubmitted = rowIndex < guesses.length;
          const isCurrent = rowIndex === guesses.length;
          const guess = isSubmitted ? guesses[rowIndex] : isCurrent ? currentGuess : '';
          const statuses = isSubmitted ? evaluateGuess(guess, targetWord) : [];

          return (
            <div key={rowIndex} className="flex gap-2">
              {Array.from({ length: wordLength }).map((__, colIndex) => {
                const char = guess[colIndex] || '';
                const status = statuses[colIndex] || 'empty';

                let cellColor = 'bg-slate-900 border-slate-800 text-slate-100';
                if (status === 'correct') {
                  cellColor = 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30';
                } else if (status === 'present') {
                  cellColor = 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-600/30';
                } else if (status === 'absent') {
                  cellColor = 'bg-slate-800 border-slate-700 text-slate-400';
                } else if (char) {
                  cellColor = 'bg-slate-800/90 border-cyan-500 text-cyan-400 scale-105';
                }

                return (
                  <div
                    key={colIndex}
                    className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center font-mono text-xl sm:text-2xl font-bold rounded-xl border-2 transition-all duration-200 ${cellColor}`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Win / Loss banner */}
        {gameStatus !== 'PLAYING' && (
          <div className="w-full max-w-sm mt-4 p-4 rounded-xl border text-center animate-fade-in bg-slate-900 border-slate-800">
            {gameStatus === 'WON' ? (
              <>
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-lg mb-1">
                  <Trophy className="w-5 h-5" /> Mot Trouvé !
                </div>
                <p className="text-slate-300 text-xs mb-3">
                  Bravo ! Vous avez trouvé le mot <span className="font-bold text-white font-mono">{targetWord}</span> en {guesses.length} essais.
                </p>
              </>
            ) : (
              <>
                <div className="text-rose-400 font-bold text-lg mb-1">
                  Partie Terminée
                </div>
                <p className="text-slate-300 text-xs mb-3">
                  Le mot mystère était : <span className="font-bold text-cyan-400 font-mono text-sm">{targetWord}</span>
                </p>
              </>
            )}

            <button
              onClick={pickNewWord}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 mx-auto shadow-lg shadow-cyan-500/25 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Mot Suivant
            </button>
          </div>
        )}
      </div>

      {/* Virtual Keyboard */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-b-xl p-3 flex flex-col gap-1.5">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
            {row.map((key) => {
              const status = letterStatuses[key];
              let keyBg = 'bg-slate-800 text-slate-200 hover:bg-slate-700';

              if (status === 'correct') {
                keyBg = 'bg-emerald-600 text-white font-bold';
              } else if (status === 'present') {
                keyBg = 'bg-amber-600 text-white font-bold';
              } else if (status === 'absent') {
                keyBg = 'bg-slate-950 text-slate-500 opacity-60';
              }

              const isWide = key === 'ENTER' || key === 'BACKSPACE';

              return (
                <button
                  key={key}
                  onClick={() => handleCharInput(key)}
                  className={`h-11 rounded-lg text-xs font-bold transition-colors select-none ${keyBg} ${
                    isWide ? 'px-3 sm:px-4 text-[10px] sm:text-xs' : 'w-8 sm:w-10'
                  }`}
                >
                  {key === 'BACKSPACE' ? '⌫' : key === 'ENTER' ? 'Valider' : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
