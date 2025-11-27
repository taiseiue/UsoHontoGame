// UI Component: Confetti
// Feature: 006-results-dashboard, User Story 3
// Celebration confetti animation

'use client';

import { useEffect, useState } from 'react';
import { type ConfettiParticle, generateConfettiParticles } from '@/lib/animations';

export interface ConfettiProps {
  active: boolean;
  duration?: number;
  particleCount?: number;
}

export function Confetti({ active, duration = 3000, particleCount = 50 }: ConfettiProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (active && !isAnimating) {
      setIsAnimating(true);
      setParticles(generateConfettiParticles(particleCount));

      const timeout = setTimeout(() => {
        setIsAnimating(false);
        setParticles([]);
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [active, isAnimating, duration, particleCount]);

  if (!isAnimating) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute h-3 w-3 animate-confetti-fall"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
            animation: `confetti-fall ${duration}ms linear forwards`,
          }}
        />
      ))}
    </div>
  );
}
