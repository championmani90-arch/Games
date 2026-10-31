import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sounds } from '../utils/audio';
import { Play, RotateCcw, Volume2, VolumeX, ArrowUp, ArrowDown } from 'lucide-react';

interface NeonRunnerProps {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number, distance: number) => void;
  bestScore?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
}

interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'laser_low' | 'drone_high' | 'barrier_spike';
}

interface Collectible {
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  pulse: number;
}

export const NeonRunner: React.FC<NeonRunnerProps> = ({
  onScoreUpdate,
  onGameOver,
  bestScore = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [isMuted, setIsMuted] = useState(sounds.isMuted());

  // Game internal state ref to avoid closure staleness in 60fps loop
  const loopRef = useRef<number | null>(null);
  const stateRef = useRef({
    player: {
      x: 100,
      y: 330,
      w: 32,
      h: 48,
      vy: 0,
      isGrounded: true,
      jumpsLeft: 2,
      isSliding: false,
      slideTimer: 0,
      runAnim: 0,
    },
    groundY: 378,
    speed: 6.5,
    distanceMeters: 0,
    score: 0,
    combo: 0,
    multiplier: 1,
    obstacles: [] as Obstacle[],
    collectibles: [] as Collectible[],
    particles: [] as Particle[],
    bgStars: [] as { x: number; y: number; speed: number; size: number }[],
    cityBuildings: [] as { x: number; w: number; h: number; color: string }[],
    lastObstacleX: 0,
    lastSpawnDist: 0,
    active: false,
  });

  const toggleMute = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  // Initialize background parallax elements
  const initEnvironment = useCallback(() => {
    const stars = [];
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * 800,
        y: Math.random() * 260,
        speed: 0.2 + Math.random() * 0.8,
        size: Math.random() * 2 + 1,
      });
    }

    const buildings = [];
    let curX = 0;
    while (curX < 1200) {
      const w = 50 + Math.random() * 70;
      const h = 80 + Math.random() * 160;
      buildings.push({
        x: curX,
        w,
        h,
        color: ['#111827', '#172033', '#1e1b4b', '#0f172a'][Math.floor(Math.random() * 4)],
      });
      curX += w + 8;
    }

    stateRef.current.bgStars = stars;
    stateRef.current.cityBuildings = buildings;
  }, []);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (!s.active) return;
    if (s.player.jumpsLeft > 0) {
      s.player.vy = -12.5;
      s.player.isGrounded = false;
      s.player.isSliding = false;
      s.player.jumpsLeft--;
      sounds.playJump();

      // Spawn burst particles at feet
      for (let i = 0; i < 8; i++) {
        s.particles.push({
          x: s.player.x + 16,
          y: s.player.y + s.player.h,
          vx: (Math.random() - 0.5) * 5,
          vy: Math.random() * 2 + 1,
          size: Math.random() * 3 + 2,
          color: s.player.jumpsLeft === 0 ? '#38bdf8' : '#06b6d4',
          alpha: 1,
          life: 20,
        });
      }
    }
  }, []);

  const slide = useCallback(() => {
    const s = stateRef.current;
    if (!s.active) return;
    if (s.player.isGrounded && !s.player.isSliding) {
      s.player.isSliding = true;
      s.player.slideTimer = 35; // frames of sliding
      sounds.playSlide();

      // Slide sparks
      for (let i = 0; i < 6; i++) {
        s.particles.push({
          x: s.player.x,
          y: s.groundY,
          vx: -Math.random() * 6 - 2,
          vy: -Math.random() * 2,
          size: 2.5,
          color: '#f59e0b',
          alpha: 1,
          life: 15,
        });
      }
    }
  }, []);

  const startGame = useCallback(() => {
    initEnvironment();
    const s = stateRef.current;
    s.player = {
      x: 100,
      y: 330,
      w: 32,
      h: 48,
      vy: 0,
      isGrounded: true,
      jumpsLeft: 2,
      isSliding: false,
      slideTimer: 0,
      runAnim: 0,
    };
    s.speed = 6.5;
    s.distanceMeters = 0;
    s.score = 0;
    s.combo = 0;
    s.multiplier = 1;
    s.obstacles = [];
    s.collectibles = [];
    s.particles = [];
    s.lastObstacleX = 600;
    s.lastSpawnDist = 0;
    s.active = true;

    setScore(0);
    setDistance(0);
    setMultiplier(1);
    setGameState('PLAYING');
  }, [initEnvironment]);

  // Handle controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'z') {
        e.preventDefault();
        if (gameState !== 'PLAYING') {
          startGame();
        } else {
          jump();
        }
      } else if (e.code === 'ArrowDown' || e.key === 's') {
        e.preventDefault();
        if (gameState === 'PLAYING') {
          slide();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, jump, slide, startGame]);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    initEnvironment();

    let animId: number;

    const render = () => {
      const s = stateRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // Clear Screen with deep night cyber gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.7, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 1. Draw Starfield
      ctx.fillStyle = '#94a3b8';
      s.bgStars.forEach((star) => {
        if (s.active) {
          star.x -= star.speed * (s.speed / 6);
          if (star.x < 0) star.x = w;
        }
        ctx.globalAlpha = 0.4 + (star.y % 5) * 0.1;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });
      ctx.globalAlpha = 1;

      // 2. City skyline parallax
      s.cityBuildings.forEach((b) => {
        if (s.active) {
          b.x -= 0.8 * (s.speed / 6);
          if (b.x + b.w < 0) {
            b.x = w + Math.random() * 20;
          }
        }
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, s.groundY - b.h, b.w, b.h);

        // Building neon antenna / window lights
        ctx.fillStyle = '#0284c7';
        ctx.globalAlpha = 0.3;
        for (let wy = s.groundY - b.h + 10; wy < s.groundY - 10; wy += 22) {
          for (let wx = b.x + 8; wx < b.x + b.w - 10; wx += 16) {
            ctx.fillRect(wx, wy, 4, 7);
          }
        }
        ctx.globalAlpha = 1;
      });

      // 3. Ground / Track
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, s.groundY, w, h - s.groundY);

      // Neon ground rim line
      const lineGrad = ctx.createLinearGradient(0, s.groundY, w, s.groundY);
      lineGrad.addColorStop(0, '#06b6d4');
      lineGrad.addColorStop(0.5, '#3b82f6');
      lineGrad.addColorStop(1, '#6366f1');
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 3;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, s.groundY);
      ctx.lineTo(w, s.groundY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Ground grid perspective lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;
      const offset = (s.distanceMeters * 5) % 30;
      for (let x = -offset; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, s.groundY);
        ctx.lineTo(x - 40, h);
        ctx.stroke();
      }

      if (s.active) {
        // Update physics & difficulty
        s.speed = Math.min(13, 6.5 + s.distanceMeters * 0.005);
        s.distanceMeters += s.speed * 0.06;
        s.score += Math.round(1 * s.multiplier);

        setScore(s.score);
        setDistance(Math.floor(s.distanceMeters));
        if (onScoreUpdate) onScoreUpdate(s.score);

        // Player physics
        const p = s.player;
        p.vy += 0.65; // gravity
        p.y += p.vy;

        // Slide logic
        if (p.isSliding) {
          p.h = 24;
          p.slideTimer--;
          if (p.slideTimer <= 0) {
            p.isSliding = false;
            p.h = 48;
          }
        } else {
          p.h = 48;
        }

        // Ground collision
        if (p.y + p.h >= s.groundY) {
          p.y = s.groundY - p.h;
          p.vy = 0;
          p.isGrounded = true;
          p.jumpsLeft = 2;
        }

        p.runAnim += s.speed * 0.08;

        // Spawn obstacles and collectibles
        const spawnInterval = Math.max(220, 360 - s.distanceMeters * 0.2);
        if (s.distanceMeters - s.lastSpawnDist > spawnInterval / 20) {
          s.lastSpawnDist = s.distanceMeters;

          // Determine obstacle type
          const rnd = Math.random();
          if (rnd < 0.45) {
            // Low barrier: jump over
            s.obstacles.push({
              x: w + 40,
              y: s.groundY - 36,
              w: 24,
              h: 36,
              type: 'laser_low',
            });
          } else if (rnd < 0.8) {
            // High beam: slide under
            s.obstacles.push({
              x: w + 40,
              y: s.groundY - 78,
              w: 38,
              h: 42,
              type: 'drone_high',
            });
          } else {
            // Spike barrier
            s.obstacles.push({
              x: w + 40,
              y: s.groundY - 44,
              w: 32,
              h: 44,
              type: 'barrier_spike',
            });
          }

          // Random collectible orb
          if (Math.random() > 0.3) {
            s.collectibles.push({
              x: w + (rnd < 0.45 ? 120 : 30),
              y: s.groundY - (rnd < 0.45 ? 65 : 25),
              radius: 9,
              collected: false,
              pulse: 0,
            });
          }
        }

        // Update obstacles
        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          const obs = s.obstacles[i];
          obs.x -= s.speed;

          // Collision check with player bounding box
          // Give 4px margin of mercy
          const pBox = {
            x: p.x + 4,
            y: p.y + 2,
            w: p.w - 8,
            h: p.h - 4,
          };

          const isColliding =
            pBox.x < obs.x + obs.w &&
            pBox.x + pBox.w > obs.x &&
            pBox.y < obs.y + obs.h &&
            pBox.y + pBox.h > obs.y;

          if (isColliding) {
            // GAME OVER
            s.active = false;
            sounds.playHit();
            setTimeout(() => sounds.playGameOver(), 100);

            // Explosion particles
            for (let k = 0; k < 25; k++) {
              s.particles.push({
                x: p.x + 16,
                y: p.y + p.h / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 4 + 2,
                color: ['#ef4444', '#f59e0b', '#38bdf8'][Math.floor(Math.random() * 3)],
                alpha: 1,
                life: 35,
              });
            }

            setGameState('GAMEOVER');
            if (onGameOver) onGameOver(s.score, Math.floor(s.distanceMeters));
            break;
          }

          if (obs.x + obs.w < -50) {
            s.obstacles.splice(i, 1);
          }
        }

        // Update collectibles
        for (let i = s.collectibles.length - 1; i >= 0; i--) {
          const c = s.collectibles[i];
          c.x -= s.speed;
          c.pulse += 0.1;

          // Check collect
          const dist = Math.hypot(p.x + p.w / 2 - c.x, p.y + p.h / 2 - c.y);
          if (dist < c.radius + 22 && !c.collected) {
            c.collected = true;
            s.combo++;
            const newMult = Math.min(5, 1 + Math.floor(s.combo / 4));
            s.multiplier = newMult;
            setMultiplier(newMult);
            s.score += 50 * newMult;
            sounds.playScore();

            // Orb sparkles
            for (let j = 0; j < 8; j++) {
              s.particles.push({
                x: c.x,
                y: c.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: 2.5,
                color: '#38bdf8',
                alpha: 1,
                life: 20,
              });
            }
          }

          if (c.x < -20 || c.collected) {
            s.collectibles.splice(i, 1);
          }
        }
      }

      // Draw collectibles
      s.collectibles.forEach((c) => {
        const glowRadius = c.radius + Math.sin(c.pulse) * 2;
        ctx.save();
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(c.x, c.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(c.x, c.y, glowRadius * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw obstacles
      s.obstacles.forEach((obs) => {
        ctx.save();
        if (obs.type === 'laser_low') {
          // Neon Laser Barrier
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(obs.x + 2, obs.y + 4, obs.w - 4, obs.h - 4);
          ctx.strokeStyle = '#f87171';
          ctx.lineWidth = 2;
          ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);

          // Top emitter bulb
          ctx.fillStyle = '#fca5a5';
          ctx.beginPath();
          ctx.arc(obs.x + obs.w / 2, obs.y, 5, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === 'drone_high') {
          // Flying surveillance drone
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h - 14);
          // Drone eye
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(obs.x + obs.w / 2, obs.y + 12, 6, 0, Math.PI * 2);
          ctx.fill();
          // Drone laser beam downward (slide zone below)
          ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
          ctx.fillRect(obs.x + 4, obs.y + obs.h - 14, obs.w - 8, 14);
        } else {
          // Spike barrier
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 8;
          ctx.fillStyle = '#7e22ce';
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + obs.h);
          ctx.lineTo(obs.x + obs.w / 2, obs.y);
          ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.restore();
      });

      // Draw particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= 1 / pt.life;
        if (pt.alpha <= 0) {
          s.particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Player Character
      const p = s.player;
      if (gameState !== 'GAMEOVER') {
        ctx.save();
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;

        if (p.isSliding) {
          // Sliding pose: streamlined horizontal cyber racer
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(p.x, p.y + 6, p.w + 14, p.h - 6);
          // Visor
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(p.x + p.w, p.y + 8, 8, 6);
          // Boost jet flame
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(p.x - 8, p.y + 10, 8, 4);
        } else {
          // Standing / Running / Jumping pose
          // Running leg sway
          const legPhase = Math.sin(p.runAnim);

          // Head / Helmet
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(p.x + 8, p.y, 16, 14);
          // Visor glow
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(p.x + 18, p.y + 4, 6, 5);

          // Torso
          ctx.fillStyle = '#0ea5e9';
          ctx.fillRect(p.x + 6, p.y + 14, 20, 18);

          // Neon chest core
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(p.x + 14, p.y + 18, 4, 6);

          // Legs
          if (p.isGrounded) {
            ctx.fillStyle = '#0369a1';
            // Leg 1
            ctx.fillRect(p.x + 8 + legPhase * 4, p.y + 32, 6, 16);
            // Leg 2
            ctx.fillRect(p.x + 18 - legPhase * 4, p.y + 32, 6, 16);
          } else {
            // Jump pose (tucked legs)
            ctx.fillStyle = '#0369a1';
            ctx.fillRect(p.x + 6, p.y + 32, 8, 12);
            ctx.fillRect(p.x + 18, p.y + 32, 8, 10);

            // Double jump trail
            if (p.jumpsLeft === 0) {
              ctx.fillStyle = '#38bdf8';
              ctx.globalAlpha = 0.5;
              ctx.fillRect(p.x + 4, p.y + 44, 24, 4);
              ctx.globalAlpha = 1;
            }
          }
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    loopRef.current = animId;

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [initEnvironment, gameState, onGameOver, onScoreUpdate]);

  return (
    <div className="flex flex-col items-center select-none w-full max-w-4xl mx-auto">
      {/* Game HUD Bar */}
      <div className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-t-xl text-xs sm:text-sm">
        <div className="flex items-center gap-4 text-slate-300">
          <div>
            <span className="text-slate-500 font-medium">Distance</span>
            <p className="font-mono tabular-nums text-base sm:text-lg font-bold text-white">
              {distance} m
            </p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Score</span>
            <p className="font-mono tabular-nums text-base sm:text-lg font-bold text-cyan-400">
              {score}
            </p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Combo</span>
            <p className="font-mono tabular-nums font-bold text-amber-400">
              x{multiplier}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-slate-500 font-medium">Record</span>
            <p className="font-mono tabular-nums font-bold text-emerald-400">
              {Math.max(bestScore, score)}
            </p>
          </div>

          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full aspect-[16/9] bg-slate-950 overflow-hidden border-x border-slate-800">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="w-full h-full object-cover block"
        />

        {/* Start Overlay */}
        {gameState === 'START' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              Cyber Runner
            </h2>
            <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
              Foncez sur les toits cybernétiques. Sautez par-dessus les lasers et glissez sous les drones pour survivre le plus loin possible.
            </p>

            <button
              onClick={startGame}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              Lancer la course (Espace)
            </button>

            <div className="mt-8 flex items-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">Espace / ↑</kbd>
                Sauter (Double saut)
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">↓</kbd>
                Glisser
              </span>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <span className="text-xs uppercase tracking-wider text-rose-400 font-bold mb-1">
              Collision Détectée
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Fin de Course !
            </h2>

            <div className="grid grid-cols-2 gap-4 max-w-xs w-full mb-6">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-left">
                <span className="text-xs text-slate-500">Score final</span>
                <p className="font-mono text-xl font-bold text-cyan-400">{score}</p>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-left">
                <span className="text-xs text-slate-500">Distance</span>
                <p className="font-mono text-xl font-bold text-white">{distance} m</p>
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              Rejouer (Espace)
            </button>
          </div>
        )}
      </div>

      {/* Mobile Touch Action Controls & Footer */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-b-xl p-3 flex items-center justify-between gap-3">
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span>Collectez les cristaux bleus pour multiplier vos points</span>
        </div>

        {/* Mobile touch controls */}
        <div className="flex sm:hidden items-center justify-center gap-4 w-full">
          <button
            onTouchStart={(e) => { e.preventDefault(); jump(); }}
            onClick={jump}
            className="flex-1 py-3 bg-slate-800 active:bg-cyan-500/20 active:border-cyan-500 border border-slate-700 rounded-lg text-sm font-bold text-cyan-400 flex items-center justify-center gap-2"
          >
            <ArrowUp className="w-4 h-4" /> Sauter
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); slide(); }}
            onClick={slide}
            className="flex-1 py-3 bg-slate-800 active:bg-amber-500/20 active:border-amber-500 border border-slate-700 rounded-lg text-sm font-bold text-amber-400 flex items-center justify-center gap-2"
          >
            <ArrowDown className="w-4 h-4" /> Glisser
          </button>
        </div>
      </div>
    </div>
  );
};
