// GameCard component
// Server Component that displays a single game card

import type { GameDto } from '@/server/application/dto/GameDto';

export interface GameCardProps {
  game: GameDto;
}

/**
 * GameCard component
 * Pure presentational Server Component for displaying game information
 */
export function GameCard({ game }: GameCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <h3 className="mb-3 text-xl font-semibold text-gray-900">{game.name}</h3>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">残り枠:</span>
          <span className="text-lg font-bold text-blue-600">{game.availableSlots}</span>
          <span className="text-sm text-gray-600">人</span>
        </div>

        <button
          type="button"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          参加する
        </button>
      </div>
    </div>
  );
}
