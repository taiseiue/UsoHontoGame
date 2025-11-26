// Domain Component: Winner Celebration
// Feature: 006-results-dashboard, User Story 3
// Displays congratulations message and celebration animation for winners

'use client';

import { Confetti } from '@/components/ui/Confetti';

export interface WinnerCelebrationProps {
  winners: { nickname: string; score: number }[];
  isActive: boolean;
}

export default function WinnerCelebration({ winners, isActive }: WinnerCelebrationProps) {
  if (!isActive || winners.length === 0) return null;

  const isTie = winners.length > 1;

  return (
    <div className="relative">
      {/* Confetti Animation */}
      <Confetti active={isActive} duration={3000} particleCount={100} />

      {/* Celebration Message */}
      <div className="rounded-lg border-4 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 p-8 shadow-xl">
        <div className="text-center">
          {/* Trophy Icon */}
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400 shadow-lg">
              <span className="text-5xl">🏆</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="mb-4 text-4xl font-bold text-yellow-900">
            {isTie ? '🎉 同点優勝！ 🎉' : '🎉 優勝おめでとう！ 🎉'}
          </h2>

          {/* Winner Names */}
          <div className="mb-4 space-y-2">
            {winners.map((winner, _index) => (
              <div key={winner.nickname} className="rounded-lg bg-white/80 px-6 py-3 shadow-md">
                <p className="text-2xl font-bold text-gray-900">{winner.nickname}</p>
                <p className="text-lg text-yellow-700">{winner.score} 点</p>
              </div>
            ))}
          </div>

          {/* Celebration Text */}
          <p className="text-lg text-gray-700">
            {isTie ? `${winners.length}名が同点で優勝しました！` : '見事、嘘を見抜きました！'}
          </p>
        </div>
      </div>
    </div>
  );
}
