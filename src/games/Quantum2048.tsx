import React, { useState, useEffect, useCallback, useRef } from 'react';
import { sounds } from '../utils/audio';
import { RotateCcw, Undo2, Volume2, VolumeX, Sparkles, Trophy } from 'lucide-react';

interface Quantum2048Props {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number, maxTile: number) => void;
  bestScore?: number;
}

type Board = number[][];

export const Quantum2048: React.FC<Quantum2048Props> = ({
  onScoreUpdate,
  onGameOver,
  bestScore = 0,
}) => {
  const [size, setSize] = useState<number>(4);
  const [board, setBoard] = useState<Board>([]);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(bestScore);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [keepPlaying, setKeepPlaying] = useState<boolean>(false);
  const [history, setHistory] = useState<{ board: Board; score: number } | null>(null);
  const [isMuted, setIsMuted] = useState(sounds.isMuted());

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const toggleMute = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  const getEmptyCells = (b: Board) => {
    const empty: { r: number; c: number }[] = [];
    for (let r = 0; r < b.length; r++) {
      for (let c = 0; c < b[r].length; c++) {
        if (b[r][c] === 0) empty.push({ r, c });
      }
    }
    return empty;
  };

  const addRandomTile = useCallback((b: Board): Board => {
    const empty = getEmptyCells(b);
    if (empty.length === 0) return b;
    const randomCell = empty[Math.floor(Math.random() * empty.length)];
    const newBoard = b.map((row) => [...row]);
    newBoard[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  }, []);

  const initGame = useCallback(
    (gridSize: number) => {
      let b: Board = Array(gridSize)
        .fill(0)
        .map(() => Array(gridSize).fill(0));
      b = addRandomTile(b);
      b = addRandomTile(b);
      setBoard(b);
      setScore(0);
      setGameOver(false);
      setHasWon(false);
      setKeepPlaying(false);
      setHistory(null);
    },
    [addRandomTile]
  );

  useEffect(() => {
    initGame(size);
  }, [size, initGame]);

  const canMove = (b: Board): boolean => {
    if (getEmptyCells(b).length > 0) return true;
    const n = b.length;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const val = b[r][c];
        if (c + 1 < n && b[r][c + 1] === val) return true;
        if (r + 1 < n && b[r + 1][c] === val) return true;
      }
    }
    return false;
  };

  const slideAndMergeRow = (row: number[]): { newRow: number[]; gained: number; maxMerged: number } => {
    const filtered = row.filter((v) => v !== 0);
    const result: number[] = [];
    let gained = 0;
    let maxMerged = 0;

    for (let i = 0; i < filtered.length; i++) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        const mergedVal = filtered[i] * 2;
        result.push(mergedVal);
        gained += mergedVal;
        if (mergedVal > maxMerged) maxMerged = mergedVal;
        i++; // skip next since merged
      } else {
        result.push(filtered[i]);
      }
    }

    while (result.length < row.length) {
      result.push(0);
    }

    return { newRow: result, gained, maxMerged };
  };

  const move = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      if (gameOver && !keepPlaying) return;

      const n = board.length;
      if (n === 0) return;

      // Save history for undo
      const prevBoard = board.map((row) => [...row]);
      const prevScore = score;

      let rotated: Board = [];
      if (direction === 'left') {
        rotated = board.map((r) => [...r]);
      } else if (direction === 'right') {
        rotated = board.map((r) => [...r].reverse());
      } else if (direction === 'up') {
        rotated = Array(n)
          .fill(0)
          .map((_, r) => Array(n).fill(0).map((__, c) => board[c][r]));
      } else if (direction === 'down') {
        rotated = Array(n)
          .fill(0)
          .map((_, r) => Array(n).fill(0).map((__, c) => board[n - 1 - c][r]));
      }

      let totalGained = 0;
      let highestMerge = 0;
      let changed = false;

      const newRotated: Board = [];
      for (let r = 0; r < n; r++) {
        const { newRow, gained, maxMerged } = slideAndMergeRow(rotated[r]);
        newRotated.push(newRow);
        totalGained += gained;
        if (maxMerged > highestMerge) highestMerge = maxMerged;
        for (let c = 0; c < n; c++) {
          if (newRow[c] !== rotated[r][c]) changed = true;
        }
      }

      if (!changed) return;

      let nextBoard: Board = [];
      if (direction === 'left') {
        nextBoard = newRotated;
      } else if (direction === 'right') {
        nextBoard = newRotated.map((r) => r.reverse());
      } else if (direction === 'up') {
        nextBoard = Array(n)
          .fill(0)
          .map((_, r) => Array(n).fill(0).map((__, c) => newRotated[c][r]));
      } else if (direction === 'down') {
        nextBoard = Array(n)
          .fill(0)
          .map((_, r) => Array(n).fill(0).map((__, c) => newRotated[c][n - 1 - r]));
      }

      const boardWithTile = addRandomTile(nextBoard);
      const newScore = score + totalGained;

      setHistory({ board: prevBoard, score: prevScore });
      setBoard(boardWithTile);
      setScore(newScore);

      if (totalGained > 0) {
        sounds.playMerge(highestMerge);
      } else {
        sounds.playChessMove();
      }

      if (newScore > highScore) {
        setHighScore(newScore);
      }
      if (onScoreUpdate) onScoreUpdate(newScore);

      // Check 2048 win
      if (!hasWon && !keepPlaying) {
        let reached2048 = false;
        for (let r = 0; r < n; r++) {
          for (let c = 0; c < n; c++) {
            if (boardWithTile[r][c] >= 2048) reached2048 = true;
          }
        }
        if (reached2048) {
          sounds.playVictory();
          setHasWon(true);
        }
      }

      // Check game over
      if (!canMove(boardWithTile)) {
        setGameOver(true);
        sounds.playGameOver();
        let maxVal = 0;
        for (let r = 0; r < n; r++) {
          for (let c = 0; c < n; c++) {
            if (boardWithTile[r][c] > maxVal) maxVal = boardWithTile[r][c];
          }
        }
        if (onGameOver) onGameOver(newScore, maxVal);
      }
    },
    [
      board,
      gameOver,
      keepPlaying,
      score,
      highScore,
      onScoreUpdate,
      hasWon,
      addRandomTile,
      onGameOver,
    ]
  );

  const handleUndo = () => {
    if (!history) return;
    setBoard(history.board);
    setScore(history.score);
    setGameOver(false);
    setHistory(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        move('up');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        move('down');
      } else if (['ArrowLeft', 'KeyA', 'KeyQ'].includes(e.code)) {
        e.preventDefault();
        move('left');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        move('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  // Touch Swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!e.touches[0]) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !e.changedTouches[0]) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 30) {
      if (absX > absY) {
        if (dx > 0) move('right');
        else move('left');
      } else {
        if (dy > 0) move('down');
        else move('up');
      }
    }
    touchStartRef.current = null;
  };

  // Styling helper for tile numbers
  const getTileStyle = (val: number) => {
    if (val === 0) return 'bg-slate-900/60 border border-slate-800/80 text-transparent';

    const colors: Record<number, string> = {
      2: 'bg-slate-800 text-slate-100 border border-slate-700',
      4: 'bg-cyan-950 text-cyan-200 border border-cyan-800',
      8: 'bg-sky-900 text-sky-100 border border-sky-600 shadow-sm shadow-sky-600/30',
      16: 'bg-indigo-900 text-indigo-100 border border-indigo-500 shadow-sm shadow-indigo-500/30',
      32: 'bg-blue-800 text-blue-100 border border-blue-400 shadow-md shadow-blue-500/30',
      64: 'bg-violet-800 text-violet-100 border border-violet-400 shadow-md shadow-violet-500/40',
      128: 'bg-amber-700 text-amber-100 border border-amber-400 shadow-lg shadow-amber-500/40',
      256: 'bg-amber-600 text-white border border-amber-300 shadow-lg shadow-amber-500/50 font-black',
      512: 'bg-emerald-600 text-white border border-emerald-300 shadow-lg shadow-emerald-500/50 font-black',
      1024: 'bg-rose-600 text-white border border-rose-300 shadow-xl shadow-rose-500/60 font-black animate-pulse',
      2048: 'bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 text-white border-2 border-white shadow-2xl shadow-cyan-500/80 font-black',
    };

    return colors[val] || 'bg-fuchsia-600 text-white border-2 border-white shadow-2xl font-black';
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-xl mx-auto">
      {/* Top Controls & Status Bar */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-900 border border-slate-800 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800/80 rounded-lg">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
              Score
            </span>
            <p className="font-mono text-lg font-bold text-cyan-400 tabular-nums">{score}</p>
          </div>
          <div className="p-2 bg-slate-800/80 rounded-lg">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
              Meilleur
            </span>
            <p className="font-mono text-lg font-bold text-emerald-400 tabular-nums">
              {Math.max(highScore, score)}
            </p>
          </div>
        </div>

        {/* Mode selector: 3x3 / 4x4 / 5x5 */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
          {[3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                size === s
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}x{s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            disabled={!history}
            title="Annuler le dernier mouvement"
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => initGame(size)}
            title="Recommencer la partie"
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
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

      {/* Main Board Arena */}
      <div
        className="relative w-full aspect-square bg-slate-950 p-4 border-x border-slate-800 flex items-center justify-center touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="w-full h-full max-w-[440px] max-h-[440px] grid gap-2.5 sm:gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
          }}
        >
          {board.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={`flex items-center justify-center rounded-xl transition-all duration-150 select-none ${getTileStyle(
                  val
                )}`}
              >
                {val > 0 && (
                  <span
                    className={`font-mono tabular-nums ${
                      size === 5
                        ? val > 512
                          ? 'text-xs sm:text-sm font-bold'
                          : 'text-sm sm:text-lg font-bold'
                        : val >= 1024
                        ? 'text-base sm:text-xl font-bold'
                        : 'text-xl sm:text-2xl font-bold'
                    }`}
                  >
                    {val}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Win Overlay Modal */}
        {hasWon && !keepPlaying && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <Trophy className="w-12 h-12 text-amber-400 mb-2 animate-bounce" />
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Objectif 2048 Atteint !
            </h3>
            <p className="text-sm text-slate-400 max-w-xs mb-6">
              Félicitations ! Vous avez fusionné la particule quantique 2048. Voulez-vous continuer
              pour repousser les limites ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setKeepPlaying(true)}
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition-all"
              >
                Continuer (Mode Infini)
              </button>
              <button
                onClick={() => initGame(size)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all"
              >
                Nouvelle partie
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay Modal */}
        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <span className="text-xs uppercase tracking-wider text-rose-400 font-bold mb-1">
              Grille Bloquée
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Plus de mouvements possibles
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Score final : <span className="font-mono text-cyan-400 font-bold">{score}</span>
            </p>
            <div className="flex gap-3">
              {history && (
                <button
                  onClick={handleUndo}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 transition-all"
                >
                  <Undo2 className="w-4 h-4" /> Annuler coup
                </button>
              )}
              <button
                onClick={() => initGame(size)}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
              >
                <RotateCcw className="w-4 h-4" /> Rejouer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Touch D-Pad Controls for Mobile / Ease of Use */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-b-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Utilisez les flèches du clavier, ZQSD ou glissez sur l'écran</span>
        </div>

        {/* Mini directional buttons for quick touch */}
        <div className="grid grid-cols-3 gap-1 w-32 sm:hidden">
          <div />
          <button
            onClick={() => move('up')}
            className="p-2 bg-slate-800 active:bg-cyan-500 active:text-slate-950 rounded text-center font-bold"
          >
            ↑
          </button>
          <div />
          <button
            onClick={() => move('left')}
            className="p-2 bg-slate-800 active:bg-cyan-500 active:text-slate-950 rounded text-center font-bold"
          >
            ←
          </button>
          <button
            onClick={() => move('down')}
            className="p-2 bg-slate-800 active:bg-cyan-500 active:text-slate-950 rounded text-center font-bold"
          >
            ↓
          </button>
          <button
            onClick={() => move('right')}
            className="p-2 bg-slate-800 active:bg-cyan-500 active:text-slate-950 rounded text-center font-bold"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};
