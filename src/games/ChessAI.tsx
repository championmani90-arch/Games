import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { sounds } from '../utils/audio';
import { RotateCcw, Undo2, Volume2, VolumeX, User, Bot } from 'lucide-react';

interface ChessAIProps {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (winner: 'white' | 'black' | 'draw') => void;
}

type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
type PieceColor = 'w' | 'b';

interface Piece {
  type: PieceType;
  color: PieceColor;
}

type Board = (Piece | null)[][];
type Position = [number, number]; // [row, col]

interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece;
  notation: string;
}

const INITIAL_BOARD: Board = [
  [
    { type: 'r', color: 'b' },
    { type: 'n', color: 'b' },
    { type: 'b', color: 'b' },
    { type: 'q', color: 'b' },
    { type: 'k', color: 'b' },
    { type: 'b', color: 'b' },
    { type: 'n', color: 'b' },
    { type: 'r', color: 'b' },
  ],
  Array(8)
    .fill(null)
    .map(() => ({ type: 'p', color: 'b' })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8)
    .fill(null)
    .map(() => ({ type: 'p', color: 'w' })),
  [
    { type: 'r', color: 'w' },
    { type: 'n', color: 'w' },
    { type: 'b', color: 'w' },
    { type: 'q', color: 'w' },
    { type: 'k', color: 'w' },
    { type: 'b', color: 'w' },
    { type: 'n', color: 'w' },
    { type: 'r', color: 'w' },
  ],
];

const PIECE_VALUES: Record<PieceType, number> = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 900,
};

// SVG rendering for chess pieces
const ChessIcon: React.FC<{ type: PieceType; color: PieceColor }> = ({ type, color }) => {
  const isWhite = color === 'w';
  const fillColor = isWhite ? '#ffffff' : '#0f172a';
  const strokeColor = isWhite ? '#38bdf8' : '#94a3b8';

  switch (type) {
    case 'p':
      return (
        <svg viewBox="0 0 45 45" className="w-4/5 h-4/5 filter drop-shadow">
          <path
            d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'r':
      return (
        <svg viewBox="0 0 45 45" className="w-4/5 h-4/5 filter drop-shadow">
          <path
            d="m 9,39 27,0 0,-3 -27,0 z m 3,-3 1.5,-21 18,0 1.5,21 z m -1.5,-21 4,-4 4,4 3,-4 4,4 3,-4 4,4 1,-4 -24,0 z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'n':
      return (
        <svg viewBox="0 0 45 45" className="w-4/5 h-4/5 filter drop-shadow">
          <path
            d="m 22,10 c -4,0 -9,3 -10,8 0,4 2,6 3,9 -3,1 -6,4 -6,8 0,3 2,5 5,5 4,0 7,-2 9,-5 2,2 5,4 8,4 3,0 5,-2 5,-5 0,-4 -3,-7 -6,-8 1,-3 3,-5 3,-9 -1,-5 -4,-7 -8,-7 z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'b':
      return (
        <svg viewBox="0 0 45 45" className="w-4/5 h-4/5 filter drop-shadow">
          <path
            d="m 9,36 c 3.39,-0.99 6.78,-0.99 10.17,-0.99 3.39,0 6.78,0 10.17,0.99 l 0,-2 c -3.39,-0.99 -6.78,-0.99 -10.17,-0.99 -3.39,0 -6.78,0 -10.17,0.99 z m 6,-4 c 1,-4 3,-9 7.5,-9 4.5,0 6.5,5 7.5,9 z m 7.5,-11 c -2,0 -3.5,-1.5 -3.5,-3.5 0,-2 1.5,-3.5 3.5,-3.5 2,0 3.5,1.5 3.5,3.5 0,2 -1.5,3.5 -3.5,3.5 z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'q':
      return (
        <svg viewBox="0 0 45 45" className="w-4/5 h-4/5 filter drop-shadow">
          <path
            d="m 9,26 c 8.5,-1.5 21,-1.5 27,0 l 2,-12 -7,5 -3,-8 -5.5,8 -5.5,-8 -3,8 -7,-5 2,12 z m 0,12 27,0 0,-3 -27,0 z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'k':
      return (
        <svg viewBox="0 0 45 45" className="w-4/5 h-4/5 filter drop-shadow">
          <path
            d="m 22.5,11.5 0,6 m -3,-3 6,0 m -6,7 c 0,0 2.5,-3 5,-3 2.5,0 5,3 5,3 l 0,9 -10,0 z m -3.5,13.5 17,0 0,-3 -17,0 z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
};

export const ChessAI: React.FC<ChessAIProps> = ({ onScoreUpdate, onGameOver }) => {
  const [board, setBoard] = useState<Board>(() =>
    INITIAL_BOARD.map((row) => row.map((cell) => (cell ? { ...cell } : null)))
  );
  const [turn, setTurn] = useState<PieceColor>('w');
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [capturedWhite, setCapturedWhite] = useState<Piece[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<Piece[]>([]);
  const [gameMode, setGameMode] = useState<'ai' | 'pass-and-play'>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [winner, setWinner] = useState<'white' | 'black' | 'draw' | null>(null);
  const [inCheck, setInCheck] = useState<PieceColor | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.isMuted());

  const toggleMute = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  // Helper to test if coordinate is on board
  const onBoard = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;

  // Generate legal moves for a piece at (r, c)
  const getMovesForPiece = useCallback(
    (b: Board, r: number, c: number): Position[] => {
      const piece = b[r][c];
      if (!piece) return [];
      const moves: Position[] = [];
      const isWhite = piece.color === 'w';
      const forward = isWhite ? -1 : 1;

      if (piece.type === 'p') {
        // Forward 1 step
        if (onBoard(r + forward, c) && !b[r + forward][c]) {
          moves.push([r + forward, c]);
          // Forward 2 steps from starting row
          const startRow = isWhite ? 6 : 1;
          if (r === startRow && onBoard(r + forward * 2, c) && !b[r + forward * 2][c]) {
            moves.push([r + forward * 2, c]);
          }
        }
        // Diagonals captures
        for (const dc of [-1, 1]) {
          const nr = r + forward;
          const nc = c + dc;
          if (onBoard(nr, nc) && b[nr][nc] && b[nr][nc]?.color !== piece.color) {
            moves.push([nr, nc]);
          }
        }
      } else if (piece.type === 'n') {
        const knightOffsets = [
          [-2, -1],
          [-2, 1],
          [-1, -2],
          [-1, 2],
          [1, -2],
          [1, 2],
          [2, -1],
          [2, 1],
        ];
        knightOffsets.forEach(([dr, dc]) => {
          const nr = r + dr;
          const nc = c + dc;
          if (onBoard(nr, nc) && (!b[nr][nc] || b[nr][nc]?.color !== piece.color)) {
            moves.push([nr, nc]);
          }
        });
      } else if (piece.type === 'b' || piece.type === 'r' || piece.type === 'q') {
        const directions: [number, number][] = [];
        if (piece.type === 'b' || piece.type === 'q') {
          directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
        }
        if (piece.type === 'r' || piece.type === 'q') {
          directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);
        }

        directions.forEach(([dr, dc]) => {
          let step = 1;
          while (true) {
            const nr = r + dr * step;
            const nc = c + dc * step;
            if (!onBoard(nr, nc)) break;
            if (!b[nr][nc]) {
              moves.push([nr, nc]);
            } else {
              if (b[nr][nc]?.color !== piece.color) {
                moves.push([nr, nc]);
              }
              break;
            }
            step++;
          }
        });
      } else if (piece.type === 'k') {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (onBoard(nr, nc) && (!b[nr][nc] || b[nr][nc]?.color !== piece.color)) {
              moves.push([nr, nc]);
            }
          }
        }
      }

      return moves;
    },
    []
  );

  // Check if given color King is under threat
  const isKingInCheck = useCallback(
    (b: Board, color: PieceColor): boolean => {
      // Find King
      let kingPos: Position | null = null;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (b[r][c]?.type === 'k' && b[r][c]?.color === color) {
            kingPos = [r, c];
            break;
          }
        }
      }
      if (!kingPos) return true; // king captured

      const opponentColor = color === 'w' ? 'b' : 'w';
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (b[r][c]?.color === opponentColor) {
            const moves = getMovesForPiece(b, r, c);
            if (moves.some(([mr, mc]) => mr === kingPos![0] && mc === kingPos![1])) {
              return true;
            }
          }
        }
      }
      return false;
    },
    [getMovesForPiece]
  );

  // Get strictly valid moves that don't leave king in check
  const getLegalMoves = useCallback(
    (b: Board, r: number, c: number): Position[] => {
      const pseudo = getMovesForPiece(b, r, c);
      const piece = b[r][c];
      if (!piece) return [];

      return pseudo.filter(([toR, toC]) => {
        // Clone board and test
        const testB = b.map((row) => [...row]);
        testB[toR][toC] = piece;
        testB[r][c] = null;
        return !isKingInCheck(testB, piece.color);
      });
    },
    [getMovesForPiece, isKingInCheck]
  );

  // Get all legal moves for current turn
  const getAllLegalMoves = useCallback(
    (b: Board, color: PieceColor): { from: Position; to: Position }[] => {
      const all: { from: Position; to: Position }[] = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (b[r][c]?.color === color) {
            const valid = getLegalMoves(b, r, c);
            valid.forEach((to) => all.push({ from: [r, c], to }));
          }
        }
      }
      return all;
    },
    [getLegalMoves]
  );

  const selectedMoves = useMemo(() => {
    if (!selectedPos) return [];
    return getLegalMoves(board, selectedPos[0], selectedPos[1]);
  }, [board, selectedPos, getLegalMoves]);

  // Execute a move on the board
  const makeMove = useCallback(
    (from: Position, to: Position) => {
      const [fromR, fromC] = from;
      const [toR, toC] = to;
      const piece = board[fromR][fromC];
      if (!piece) return;

      const captured = board[toR][toC] || undefined;
      const newBoard = board.map((row) => [...row]);

      // Handle pawn promotion to Queen
      let newPiece = { ...piece };
      if (piece.type === 'p' && (toR === 0 || toR === 7)) {
        newPiece = { type: 'q', color: piece.color };
      }

      newBoard[toR][toC] = newPiece;
      newBoard[fromR][fromC] = null;

      // Notation
      const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const piecePrefix = piece.type === 'p' ? '' : piece.type.toUpperCase();
      const capSymbol = captured ? 'x' : '';
      const notation = `${piecePrefix}${capSymbol}${cols[toC]}${8 - toR}`;

      if (captured) {
        sounds.playChessCapture();
        if (captured.color === 'w') {
          setCapturedWhite((prev) => [...prev, captured]);
        } else {
          setCapturedBlack((prev) => [...prev, captured]);
        }
      } else {
        sounds.playChessMove();
      }

      const nextTurn = turn === 'w' ? 'b' : 'w';
      setBoard(newBoard);
      setSelectedPos(null);
      setMoveHistory((prev) => [...prev, { from, to, piece, captured, notation }]);
      setTurn(nextTurn);

      // Check state for next player
      const nextInCheck = isKingInCheck(newBoard, nextTurn);
      setInCheck(nextInCheck ? nextTurn : null);

      // Check Checkmate or Stalemate
      const nextMoves = getAllLegalMoves(newBoard, nextTurn);
      if (nextMoves.length === 0) {
        if (nextInCheck) {
          // Checkmate!
          const winColor = turn === 'w' ? 'white' : 'black';
          setWinner(winColor);
          sounds.playVictory();
          if (onGameOver) onGameOver(winColor);
          if (onScoreUpdate && winColor === 'white') onScoreUpdate(1000);
        } else {
          // Stalemate
          setWinner('draw');
          sounds.playGameOver();
          if (onGameOver) onGameOver('draw');
        }
      }
    },
    [board, turn, isKingInCheck, getAllLegalMoves, onGameOver, onScoreUpdate]
  );

  // Simple yet smart AI Evaluation & Minimax
  const triggerAiTurn = useCallback(() => {
    setIsAiThinking(true);
    setTimeout(() => {
      const allMoves = getAllLegalMoves(board, 'b');
      if (allMoves.length === 0) {
        setIsAiThinking(false);
        return;
      }

      let bestMove = allMoves[0];

      if (aiDifficulty === 'easy') {
        // Opportunistic or random
        const captureMoves = allMoves.filter((m) => board[m.to[0]][m.to[1]] !== null);
        if (captureMoves.length > 0 && Math.random() < 0.6) {
          bestMove = captureMoves[Math.floor(Math.random() * captureMoves.length)];
        } else {
          bestMove = allMoves[Math.floor(Math.random() * allMoves.length)];
        }
      } else {
        // Medium & Hard: positional heuristic evaluation
        let bestVal = -Infinity;

        allMoves.forEach((m) => {
          const testB = board.map((row) => [...row]);
          const captured = testB[m.to[0]][m.to[1]];
          testB[m.to[0]][m.to[1]] = testB[m.from[0]][m.from[1]];
          testB[m.from[0]][m.from[1]] = null;

          let val = 0;
          if (captured) {
            val += PIECE_VALUES[captured.type] * 10;
          }

          // Center control bonus (d4, d5, e4, e5)
          const [r, c] = m.to;
          if ((r === 3 || r === 4) && (c === 3 || c === 4)) {
            val += 4;
          }

          // Piece development from back rank
          if (m.from[0] === 0) val += 2;

          // Check opponent King
          if (isKingInCheck(testB, 'w')) {
            val += 15;
          }

          if (aiDifficulty === 'hard') {
            // Check if piece would be captured on next turn
            const oppMoves = getAllLegalMoves(testB, 'w');
            if (oppMoves.some((om) => om.to[0] === r && om.to[1] === c)) {
              val -= PIECE_VALUES[board[m.from[0]][m.from[1]]!.type] * 8;
            }
          }

          // Add slight jitter for non-deterministic play
          val += Math.random() * 2;

          if (val > bestVal) {
            bestVal = val;
            bestMove = m;
          }
        });
      }

      setIsAiThinking(false);
      makeMove(bestMove.from, bestMove.to);
    }, 450);
  }, [board, getAllLegalMoves, aiDifficulty, isKingInCheck, makeMove]);

  // Trigger AI if black turn in AI mode
  useEffect(() => {
    if (gameMode === 'ai' && turn === 'b' && !winner) {
      triggerAiTurn();
    }
  }, [turn, gameMode, winner, triggerAiTurn]);

  // Click handler for board square
  const handleSquareClick = (r: number, c: number) => {
    if (winner || isAiThinking) return;
    if (gameMode === 'ai' && turn === 'b') return;

    const clickedPiece = board[r][c];

    if (selectedPos) {
      const isLegal = selectedMoves.some(([mr, mc]) => mr === r && mc === c);
      if (isLegal) {
        makeMove(selectedPos, [r, c]);
        return;
      }
    }

    if (clickedPiece && clickedPiece.color === turn) {
      setSelectedPos([r, c]);
    } else {
      setSelectedPos(null);
    }
  };

  const handleReset = () => {
    setBoard(INITIAL_BOARD.map((row) => row.map((cell) => (cell ? { ...cell } : null))));
    setTurn('w');
    setSelectedPos(null);
    setMoveHistory([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setWinner(null);
    setInCheck(null);
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-2xl mx-auto">
      {/* Top HUD Bar */}
      <div className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-t-xl text-xs sm:text-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-lg text-slate-200">
            {gameMode === 'ai' ? <Bot className="w-4 h-4 text-cyan-400" /> : <User className="w-4 h-4 text-emerald-400" />}
            <span className="font-semibold">{gameMode === 'ai' ? 'Contre IA' : 'Duel 2 Joueurs'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Tour :</span>
            <span
              className={`font-bold flex items-center gap-1.5 ${
                turn === 'w' ? 'text-white' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-3 h-3 rounded-full border ${
                  turn === 'w' ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-600'
                }`}
              />
              {turn === 'w' ? 'Blancs' : 'Noirs'} {isAiThinking && '(Réfléchit...)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {inCheck && !winner && (
            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 font-bold border border-rose-500/40 rounded text-xs animate-pulse">
              Échec !
            </span>
          )}

          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Opponent Captured Tray */}
      <div className="w-full bg-slate-950 border-x border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 min-h-[36px]">
        <div className="flex items-center gap-1">
          <span className="text-slate-500 mr-2">Prises Noires:</span>
          {capturedWhite.map((p, i) => (
            <span key={i} className="text-base leading-none">
              {p.type === 'q' ? '♛' : p.type === 'r' ? '♜' : p.type === 'b' ? '♝' : p.type === 'n' ? '♞' : '♟'}
            </span>
          ))}
        </div>

        {gameMode === 'ai' && (
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            <span className="text-[11px] text-slate-500">IA:</span>
            {(['easy', 'medium', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setAiDifficulty(diff)}
                className={`text-[11px] px-1.5 py-0.5 rounded ${
                  aiDifficulty === diff
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {diff === 'easy' ? 'Débutant' : diff === 'medium' ? 'Inter.' : 'Expert'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chess Board */}
      <div className="relative w-full aspect-square max-w-[480px] p-2 sm:p-4 bg-slate-950 border-x border-slate-800 flex items-center justify-center">
        <div className="w-full h-full grid grid-cols-8 grid-rows-8 border-2 border-slate-700 shadow-2xl rounded-sm overflow-hidden">
          {board.map((row, r) =>
            row.map((piece, c) => {
              const isDark = (r + c) % 2 === 1;
              const isSelected = selectedPos && selectedPos[0] === r && selectedPos[1] === c;
              const isTargetMove = selectedMoves.some(([mr, mc]) => mr === r && mc === c);
              const isKingChecked =
                inCheck && piece?.type === 'k' && piece?.color === inCheck;

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleSquareClick(r, c)}
                  className={`relative flex items-center justify-center transition-colors ${
                    isDark ? 'bg-slate-800' : 'bg-slate-600'
                  } ${isSelected ? 'ring-3 ring-cyan-400 z-10' : ''} ${
                    isKingChecked ? 'bg-rose-900/80 ring-2 ring-rose-500' : ''
                  }`}
                >
                  {/* Coordinate labels on border squares */}
                  {c === 0 && (
                    <span className="absolute top-0.5 left-1 text-[9px] font-mono text-slate-400 select-none">
                      {8 - r}
                    </span>
                  )}
                  {r === 7 && (
                    <span className="absolute bottom-0.5 right-1 text-[9px] font-mono text-slate-400 select-none">
                      {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][c]}
                    </span>
                  )}

                  {/* Piece */}
                  {piece && <ChessIcon type={piece.type} color={piece.color} />}

                  {/* Legal move indicator dot */}
                  {isTargetMove && (
                    <div
                      className={`absolute rounded-full ${
                        piece
                          ? 'w-full h-full border-4 border-cyan-400/80 bg-cyan-400/20'
                          : 'w-3 h-3 sm:w-3.5 sm:h-3.5 bg-cyan-400 shadow-md shadow-cyan-400/50'
                      }`}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Victory / Checkmate Modal */}
        {winner && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold mb-1">
              Partie Terminée
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              {winner === 'draw'
                ? 'Partie Nulle (Pat)'
                : winner === 'white'
                ? 'Victoire des Blancs !'
                : 'Victoire des Noirs !'}
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              {winner === 'white'
                ? 'Félicitations pour cette belle stratégie !'
                : 'Bien combattu ! Retentez votre chance contre l\'IA.'}
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
            >
              <RotateCcw className="w-4 h-4" /> Rejouer une partie
            </button>
          </div>
        )}
      </div>

      {/* Player Captured Tray */}
      <div className="w-full bg-slate-950 border-x border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 min-h-[36px]">
        <div className="flex items-center gap-1">
          <span className="text-slate-500 mr-2">Prises Blanches:</span>
          {capturedBlack.map((p, i) => (
            <span key={i} className="text-base leading-none text-white">
              {p.type === 'q' ? '♕' : p.type === 'r' ? '♖' : p.type === 'b' ? '♗' : p.type === 'n' ? '♘' : '♙'}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setGameMode(gameMode === 'ai' ? 'pass-and-play' : 'ai')}
            className="text-xs text-cyan-400 hover:underline"
          >
            Changer mode ({gameMode === 'ai' ? 'Passer à 2 joueurs' : 'Passer contre IA'})
          </button>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-b-xl p-3 flex items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Historique : {moveHistory.slice(-4).map((m) => m.notation).join(' · ') || 'Aucun coup'}</span>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Recommencer
        </button>
      </div>
    </div>
  );
};
