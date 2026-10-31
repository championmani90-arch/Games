import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sounds } from '../utils/audio';
import { Play, RotateCcw, Volume2, VolumeX, Shield, Zap, Sparkles } from 'lucide-react';

interface BrickBreakerProps {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number, level: number) => void;
  bestScore?: number;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Brick {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  type: 'regular' | 'armored' | 'explosive' | 'powerup';
  color: string;
}

interface PowerUp {
  x: number;
  y: number;
  vy: number;
  type: 'multiball' | 'expand' | 'laser' | 'shield';
  w: number;
  h: number;
}

interface Laser {
  x: number;
  y: number;
  vy: number;
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

export const BrickBreaker: React.FC<BrickBreakerProps> = ({
  onScoreUpdate,
  onGameOver,
  bestScore = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'LEVEL_CLEAR' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [isMuted, setIsMuted] = useState(sounds.isMuted());

  const stateRef = useRef({
    paddle: {
      x: 350,
      y: 450,
      w: 100,
      baseW: 100,
      h: 14,
      speed: 9,
      hasLaser: false,
      laserTimer: 0,
    },
    balls: [] as Ball[],
    bricks: [] as Brick[],
    powerups: [] as PowerUp[],
    lasers: [] as Laser[],
    particles: [] as Particle[],
    shieldActive: false,
    score: 0,
    lives: 3,
    level: 1,
    active: false,
    ballAttached: true,
  });

  const toggleMute = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  const createLevelBricks = useCallback((lvl: number): Brick[] => {
    const bricks: Brick[] = [];
    const rows = 5 + Math.min(lvl, 3);
    const cols = 9;
    const padding = 8;
    const brickW = (800 - 60 - (cols - 1) * padding) / cols;
    const brickH = 22;
    const startY = 60;
    const startX = 30;

    let id = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Skip some slots in higher levels to make fun geometric shapes
        if (lvl === 2 && (r + c) % 2 === 1) continue;
        if (lvl === 3 && (c === 0 || c === cols - 1) && r > 2) continue;

        let type: Brick['type'] = 'regular';
        let hp = 1;
        let color = '#38bdf8';

        if (r === 0) {
          type = 'armored';
          hp = 2 + (lvl > 2 ? 1 : 0);
          color = '#f59e0b';
        } else if ((r * cols + c) % 7 === 0) {
          type = 'explosive';
          hp = 1;
          color = '#ef4444';
        } else if ((r * cols + c) % 5 === 0) {
          type = 'powerup';
          hp = 1;
          color = '#a855f7';
        } else if (r % 2 === 0) {
          color = '#06b6d4';
        } else {
          color = '#ec4899';
        }

        bricks.push({
          id: id++,
          x: startX + c * (brickW + padding),
          y: startY + r * (brickH + padding),
          w: brickW,
          h: brickH,
          hp,
          maxHp: hp,
          type,
          color,
        });
      }
    }
    return bricks;
  }, []);

  const launchBall = useCallback(() => {
    const s = stateRef.current;
    if (s.ballAttached && s.balls.length > 0) {
      s.ballAttached = false;
      const b = s.balls[0];
      const angle = -Math.PI / 3 + Math.random() * (Math.PI / 3) - Math.PI / 6;
      const speed = 7.5;
      b.vx = Math.sin(angle) * speed;
      b.vy = -Math.cos(angle) * speed;
      sounds.playBounce(1.2);
    }
  }, []);

  const shootLaser = useCallback(() => {
    const s = stateRef.current;
    if (!s.active || !s.paddle.hasLaser) return;
    s.lasers.push({ x: s.paddle.x + 8, y: s.paddle.y, vy: -12 });
    s.lasers.push({ x: s.paddle.x + s.paddle.w - 8, y: s.paddle.y, vy: -12 });
    sounds.playBounce(1.8);
  }, []);

  const startLevel = useCallback(
    (lvl: number) => {
      const s = stateRef.current;
      s.level = lvl;
      setLevel(lvl);
      s.bricks = createLevelBricks(lvl);
      s.powerups = [];
      s.lasers = [];
      s.particles = [];
      s.ballAttached = true;
      s.paddle.w = s.paddle.baseW;
      s.paddle.hasLaser = false;

      s.balls = [
        {
          x: s.paddle.x + s.paddle.w / 2,
          y: s.paddle.y - 10,
          vx: 0,
          vy: 0,
          radius: 7,
        },
      ];
      s.active = true;
      setGameState('PLAYING');
    },
    [createLevelBricks]
  );

  const startNewGame = useCallback(() => {
    const s = stateRef.current;
    s.score = 0;
    s.lives = 3;
    setScore(0);
    setLives(3);
    startLevel(1);
  }, [startLevel]);

  // Handle keyboard & mouse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'START' || gameState === 'GAMEOVER') {
          startNewGame();
        } else if (gameState === 'LEVEL_CLEAR') {
          startLevel(s.level + 1);
        } else if (s.ballAttached) {
          launchBall();
        } else if (s.paddle.hasLaser) {
          shootLaser();
        }
      } else if (e.code === 'ArrowLeft' || e.key === 'q' || e.key === 'a') {
        s.paddle.x = Math.max(0, s.paddle.x - 28);
        if (s.ballAttached && s.balls[0]) {
          s.balls[0].x = s.paddle.x + s.paddle.w / 2;
        }
      } else if (e.code === 'ArrowRight' || e.key === 'd') {
        s.paddle.x = Math.min(800 - s.paddle.w, s.paddle.x + 28);
        if (s.ballAttached && s.balls[0]) {
          s.balls[0].x = s.paddle.x + s.paddle.w / 2;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, launchBall, shootLaser, startLevel, startNewGame]);

  // Mouse / Touch movement tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;

    const s = stateRef.current;
    s.paddle.x = Math.max(0, Math.min(800 - s.paddle.w, mouseX - s.paddle.w / 2));
    if (s.ballAttached && s.balls[0]) {
      s.balls[0].x = s.paddle.x + s.paddle.w / 2;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!e.touches[0]) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const touchX = (e.touches[0].clientX - rect.left) * scaleX;

    const s = stateRef.current;
    s.paddle.x = Math.max(0, Math.min(800 - s.paddle.w, touchX - s.paddle.w / 2));
    if (s.ballAttached && s.balls[0]) {
      s.balls[0].x = s.paddle.x + s.paddle.w / 2;
    }
  };

  // Main Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const s = stateRef.current;
      const w = 800;
      const h = 480;

      // Dark sci-fi arena background
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Arena boundary glow
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, w - 20, h - 20);

      // If active playing state
      if (s.active && gameState === 'PLAYING') {
        // Laser timer update
        if (s.paddle.hasLaser) {
          s.paddle.laserTimer--;
          if (s.paddle.laserTimer <= 0) s.paddle.hasLaser = false;
        }

        // Update Lasers
        for (let l = s.lasers.length - 1; l >= 0; l--) {
          const lsr = s.lasers[l];
          lsr.y += lsr.vy;

          // Check hit brick
          for (let b = s.bricks.length - 1; b >= 0; b--) {
            const brick = s.bricks[b];
            if (
              lsr.x > brick.x &&
              lsr.x < brick.x + brick.w &&
              lsr.y > brick.y &&
              lsr.y < brick.y + brick.h
            ) {
              brick.hp--;
              sounds.playBrickDestroy();
              s.lasers.splice(l, 1);
              if (brick.hp <= 0) {
                s.score += 60;
                setScore(s.score);
                if (onScoreUpdate) onScoreUpdate(s.score);
                s.bricks.splice(b, 1);
              }
              break;
            }
          }

          if (lsr.y < 0) {
            s.lasers.splice(l, 1);
          }
        }

        // Update Balls
        for (let i = s.balls.length - 1; i >= 0; i--) {
          const ball = s.balls[i];

          if (s.ballAttached) {
            ball.x = s.paddle.x + s.paddle.w / 2;
            ball.y = s.paddle.y - ball.radius - 2;
            continue;
          }

          ball.x += ball.vx;
          ball.y += ball.vy;

          // Wall bounces
          if (ball.x - ball.radius <= 10) {
            ball.x = 10 + ball.radius;
            ball.vx = -ball.vx;
            sounds.playBounce(1);
          } else if (ball.x + ball.radius >= w - 10) {
            ball.x = w - 10 - ball.radius;
            ball.vx = -ball.vx;
            sounds.playBounce(1);
          }

          if (ball.y - ball.radius <= 10) {
            ball.y = 10 + ball.radius;
            ball.vy = -ball.vy;
            sounds.playBounce(1.1);
          }

          // Paddle collision
          const p = s.paddle;
          if (
            ball.y + ball.radius >= p.y &&
            ball.y - ball.radius <= p.y + p.h &&
            ball.x >= p.x - 4 &&
            ball.x <= p.x + p.w + 4 &&
            ball.vy > 0
          ) {
            // Deflection angle based on hit position
            const hitOffset = (ball.x - (p.x + p.w / 2)) / (p.w / 2);
            const maxBounceAngle = Math.PI / 2.6; // ~69 degrees
            const bounceAngle = hitOffset * maxBounceAngle;
            const currentSpeed = Math.hypot(ball.vx, ball.vy);
            const speed = Math.min(11, currentSpeed + 0.05);

            ball.vx = speed * Math.sin(bounceAngle);
            ball.vy = -speed * Math.cos(bounceAngle);
            sounds.playBounce(1.3);

            // Paddle impact sparkles
            for (let k = 0; k < 5; k++) {
              s.particles.push({
                x: ball.x,
                y: p.y,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 3,
                size: 2,
                color: '#38bdf8',
                alpha: 1,
                life: 15,
              });
            }
          }

          // Safety energy floor check
          if (s.shieldActive && ball.y + ball.radius >= h - 18) {
            ball.vy = -Math.abs(ball.vy);
            s.shieldActive = false;
            sounds.playBounce(1.5);
          }

          // Brick collision check
          for (let b = s.bricks.length - 1; b >= 0; b--) {
            const brick = s.bricks[b];

            // Nearest point on brick rectangle to ball center
            const testX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.w));
            const testY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.h));
            const distX = ball.x - testX;
            const distY = ball.y - testY;
            const distance = Math.hypot(distX, distY);

            if (distance <= ball.radius) {
              // Brick was hit!
              brick.hp--;

              // Bounce ball
              if (Math.abs(distX) > Math.abs(distY)) {
                ball.vx = -ball.vx;
              } else {
                ball.vy = -ball.vy;
              }

              sounds.playBounce(1.4);

              // Brick hit / shatter particles
              for (let k = 0; k < (brick.hp <= 0 ? 12 : 4); k++) {
                s.particles.push({
                  x: testX,
                  y: testY,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  size: Math.random() * 3 + 1.5,
                  color: brick.color,
                  alpha: 1,
                  life: 25,
                });
              }

              if (brick.hp <= 0) {
                sounds.playBrickDestroy();
                s.score += brick.type === 'armored' ? 150 : 80;
                setScore(s.score);
                if (onScoreUpdate) onScoreUpdate(s.score);

                // Explosive brick triggers neighbors
                if (brick.type === 'explosive') {
                  sounds.playBrickDestroy();
                  for (let ob = s.bricks.length - 1; ob >= 0; ob--) {
                    if (ob === b) continue;
                    const other = s.bricks[ob];
                    const distFromExplosion = Math.hypot(
                      brick.x + brick.w / 2 - (other.x + other.w / 2),
                      brick.y + brick.h / 2 - (other.y + other.h / 2)
                    );
                    if (distFromExplosion < 90) {
                      other.hp = 0;
                      s.score += 50;
                      // Burst particles
                      for (let exp = 0; exp < 6; exp++) {
                        s.particles.push({
                          x: other.x + other.w / 2,
                          y: other.y + other.h / 2,
                          vx: (Math.random() - 0.5) * 8,
                          vy: (Math.random() - 0.5) * 8,
                          size: 3,
                          color: '#f87171',
                          alpha: 1,
                          life: 30,
                        });
                      }
                    }
                  }
                }

                // Drop powerup if designated
                if (brick.type === 'powerup' || Math.random() < 0.15) {
                  const types: PowerUp['type'][] = ['multiball', 'expand', 'laser', 'shield'];
                  const picked = types[Math.floor(Math.random() * types.length)];
                  s.powerups.push({
                    x: brick.x + brick.w / 2,
                    y: brick.y + brick.h / 2,
                    vy: 2.5,
                    type: picked,
                    w: 22,
                    h: 22,
                  });
                }

                s.bricks.splice(b, 1);
              }
              break;
            }
          }

          // Bottom loss
          if (ball.y - ball.radius > h) {
            s.balls.splice(i, 1);
          }
        }

        // Filter out destroyed bricks from chain explosions
        s.bricks = s.bricks.filter((b) => b.hp > 0);

        // Check if all balls lost
        if (s.balls.length === 0) {
          s.lives--;
          setLives(s.lives);
          sounds.playHit();

          if (s.lives <= 0) {
            s.active = false;
            sounds.playGameOver();
            setGameState('GAMEOVER');
            if (onGameOver) onGameOver(s.score, s.level);
          } else {
            // Reset ball to paddle
            s.ballAttached = true;
            s.paddle.w = s.paddle.baseW;
            s.paddle.hasLaser = false;
            s.balls = [
              {
                x: s.paddle.x + s.paddle.w / 2,
                y: s.paddle.y - 10,
                vx: 0,
                vy: 0,
                radius: 7,
              },
            ];
          }
        }

        // Check Level Clear
        if (s.bricks.length === 0) {
          s.active = false;
          sounds.playVictory();
          setGameState('LEVEL_CLEAR');
        }

        // Update Powerups
        for (let p = s.powerups.length - 1; p >= 0; p--) {
          const pu = s.powerups[p];
          pu.y += pu.vy;

          // Check paddle catch
          const pad = s.paddle;
          if (
            pu.y + pu.h >= pad.y &&
            pu.y <= pad.y + pad.h &&
            pu.x + pu.w >= pad.x &&
            pu.x <= pad.x + pad.w
          ) {
            sounds.playPowerup();
            s.score += 100;
            setScore(s.score);

            if (pu.type === 'multiball') {
              if (s.balls.length > 0) {
                const base = s.balls[0];
                s.balls.push({
                  x: base.x,
                  y: base.y,
                  vx: base.vx * 0.8 + 2,
                  vy: base.vy,
                  radius: 7,
                });
                s.balls.push({
                  x: base.x,
                  y: base.y,
                  vx: base.vx * 0.8 - 2,
                  vy: base.vy,
                  radius: 7,
                });
              }
            } else if (pu.type === 'expand') {
              pad.w = Math.min(160, pad.baseW * 1.5);
              setTimeout(() => {
                pad.w = pad.baseW;
              }, 12000);
            } else if (pu.type === 'laser') {
              pad.hasLaser = true;
              pad.laserTimer = 450; // ~7.5s
            } else if (pu.type === 'shield') {
              s.shieldActive = true;
            }

            s.powerups.splice(p, 1);
            continue;
          }

          if (pu.y > h) {
            s.powerups.splice(p, 1);
          }
        }
      }

      // Draw Safety Shield Floor if active
      if (s.shieldActive) {
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(10, h - 14);
        ctx.lineTo(w - 10, h - 14);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Bricks
      s.bricks.forEach((brick) => {
        ctx.save();
        ctx.fillStyle = brick.color;
        ctx.shadowColor = brick.color;
        ctx.shadowBlur = 6;
        ctx.fillRect(brick.x, brick.y, brick.w, brick.h);

        // Highlight shine on top border
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(brick.x, brick.y, brick.w, 3);

        // Armored cracks
        if (brick.type === 'armored' && brick.hp < brick.maxHp) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(brick.x + 8, brick.y + brick.h / 2);
          ctx.lineTo(brick.x + brick.w / 2, brick.y + 4);
          ctx.lineTo(brick.x + brick.w - 8, brick.y + brick.h - 4);
          ctx.stroke();
        }

        // Explosive icon or powerup star
        if (brick.type === 'explosive') {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(brick.x + brick.w / 2, brick.y + brick.h / 2, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (brick.type === 'powerup') {
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(brick.x + brick.w / 2, brick.y + brick.h / 2, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Draw Powerup Drops
      s.powerups.forEach((pu) => {
        ctx.save();
        ctx.fillStyle =
          pu.type === 'multiball'
            ? '#38bdf8'
            : pu.type === 'laser'
            ? '#ef4444'
            : pu.type === 'shield'
            ? '#10b981'
            : '#f59e0b';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        ctx.fillRect(pu.x - pu.w / 2, pu.y - pu.h / 2, pu.w, pu.h);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(pu.x - pu.w / 2, pu.y - pu.h / 2, pu.w, pu.h);
        ctx.restore();
      });

      // Draw Lasers
      ctx.save();
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 8;
      s.lasers.forEach((lsr) => {
        ctx.fillRect(lsr.x - 2, lsr.y, 4, 12);
      });
      ctx.restore();

      // Draw Particles
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

      // Draw Paddle
      const p = s.paddle;
      ctx.save();
      ctx.fillStyle = p.hasLaser ? '#ef4444' : '#0ea5e9';
      ctx.shadowColor = p.hasLaser ? '#ef4444' : '#0284c7';
      ctx.shadowBlur = 10;
      ctx.fillRect(p.x, p.y, p.w, p.h);

      // Paddle neon core line
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(p.x + 6, p.y + 4, p.w - 12, 3);

      // Laser cannons
      if (p.hasLaser) {
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(p.x + 4, p.y - 4, 6, 4);
        ctx.fillRect(p.x + p.w - 10, p.y - 4, 6, 4);
      }
      ctx.restore();

      // Draw Balls
      s.balls.forEach((ball) => {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState, onGameOver, onScoreUpdate]);

  return (
    <div className="flex flex-col items-center select-none w-full max-w-4xl mx-auto">
      {/* Game HUD Bar */}
      <div className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-t-xl text-xs sm:text-sm">
        <div className="flex items-center gap-4 text-slate-300">
          <div>
            <span className="text-slate-500 font-medium">Niveau</span>
            <p className="font-mono tabular-nums text-base sm:text-lg font-bold text-white">
              {level} / 3
            </p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Score</span>
            <p className="font-mono tabular-nums text-base sm:text-lg font-bold text-cyan-400">
              {score}
            </p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Vies</span>
            <div className="flex items-center gap-1 mt-0.5">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full ${
                    idx < lives ? 'bg-rose-500 shadow-xs shadow-rose-500' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-slate-500 font-medium">Meilleur score</span>
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
      <div
        className="relative w-full aspect-[16/9.6] bg-slate-950 overflow-hidden border-x border-slate-800 cursor-crosshair"
        onClick={() => {
          if (stateRef.current.ballAttached) launchBall();
          else if (stateRef.current.paddle.hasLaser) shootLaser();
        }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={480}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="w-full h-full object-cover block"
        />

        {/* Start Overlay */}
        {gameState === 'START' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              Casse-Briques Nova
            </h2>
            <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
              Détruisez les briques cybernétiques, attrapez les bonus multi-balles et lasers, et protégez vos vies spatiales !
            </p>

            <button
              onClick={startNewGame}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              Lancer la partie (Espace)
            </button>

            <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                Souris / Toucher pour déplacer la raquette
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Clic ou Espace pour lancer la balle
              </span>
            </div>
          </div>
        )}

        {/* Level Clear Overlay */}
        {gameState === 'LEVEL_CLEAR' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-1">
              Secteur Nettoyé
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Niveau {level} Terminé !
            </h2>

            <p className="text-slate-400 text-sm mb-6">
              Score actuel : <span className="font-bold text-cyan-400">{score}</span> points
            </p>

            <button
              onClick={() => startLevel(level < 3 ? level + 1 : 1)}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-5 h-5" />
              {level < 3 ? `Passer au Niveau ${level + 1} (Espace)` : 'Recommencer en Maître'}
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <span className="text-xs uppercase tracking-wider text-rose-400 font-bold mb-1">
              Bouclier Épuisé
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Partie Terminée
            </h2>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-center max-w-xs w-full mb-6">
              <span className="text-xs text-slate-500">Score final</span>
              <p className="font-mono text-2xl font-bold text-cyan-400">{score}</p>
            </div>

            <button
              onClick={startNewGame}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              Rejouer (Espace)
            </button>
          </div>
        )}
      </div>

      {/* Footer controls instruction */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-b-xl p-3 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            Briques blindées (multi-coups)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            Explosives
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />
            Bonus Laser & Multi-Balle
          </span>
        </div>

        <button
          onClick={() => {
            if (stateRef.current.ballAttached) launchBall();
            else if (stateRef.current.paddle.hasLaser) shootLaser();
          }}
          className="sm:hidden px-3 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs"
        >
          {stateRef.current.ballAttached ? 'Lancer' : 'Tirer'}
        </button>
      </div>
    </div>
  );
};
