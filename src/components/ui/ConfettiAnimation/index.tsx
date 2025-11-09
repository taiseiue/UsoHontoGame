'use client';

import { useEffect, useRef, useState } from 'react';

export interface ConfettiAnimationProps {
  /** Whether the confetti animation is active */
  active: boolean;
  /** Number of confetti particles (default: 50) */
  particleCount?: number;
  /** Duration of animation in milliseconds (default: 5000) */
  duration?: number;
  /** Custom colors for confetti */
  colors?: string[];
  /** Z-index for layering (default: 1000) */
  zIndex?: number;
}

interface ConfettiParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  width: number;
  height: number;
}

const DEFAULT_COLORS = ['#FFC700', '#FF0000', '#2E3191', '#41BBC7', '#00FF00', '#FF00FF'];

/**
 * ConfettiAnimation component
 *
 * Displays celebratory confetti animation with customizable particles
 */
export function ConfettiAnimation({
  active,
  particleCount = 50,
  duration = 5000,
  colors = DEFAULT_COLORS,
  zIndex = 1000,
}: ConfettiAnimationProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    // Initialize particles
    const initialParticles: ConfettiParticle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: `confetti-${i}`,
      x: Math.random() * 100, // Percentage
      y: -10, // Start above viewport
      vx: (Math.random() - 0.5) * 2, // Horizontal velocity
      vy: Math.random() * 3 + 2, // Vertical velocity
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      width: Math.random() * 10 + 5,
      height: Math.random() * 10 + 5,
    }));

    setParticles(initialParticles);
    startTimeRef.current = Date.now();

    // Animation loop
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;

      if (elapsed > duration) {
        // Animation complete
        setParticles([]);
        return;
      }

      setParticles(
        (prevParticles) =>
          prevParticles
            .map((particle) => ({
              ...particle,
              x: particle.x + particle.vx * 0.1,
              y: particle.y + particle.vy * 0.5,
              vy: particle.vy + 0.1, // Gravity
              rotation: particle.rotation + particle.rotationSpeed,
            }))
            .filter((particle) => particle.y < 110) // Remove particles that fall off screen
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [active, particleCount, duration, colors]);

  if (!active && particles.length === 0) {
    return null;
  }

  return (
    <div
      data-testid="confetti-container"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex }}
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          data-testid={`confetti-piece-${particle.id}`}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.width}px`,
            height: `${particle.height}px`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      ))}
    </div>
  );
}
