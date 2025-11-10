// GameList component
// Server Component that displays a list of games

import type { GameDto } from '@/server/application/dto/GameDto';
import { GameCard } from './GameCard';

export interface GameListProps {
  games: GameDto[];
}

/**
 * GameList component
 * Pure presentational Server Component for displaying game list
 */
export function GameList({ games }: GameListProps) {
  if (games.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-600">
          現在参加可能なゲームはありません。
          <br />
          新しいゲームが作成されるまでお待ちください。
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">参加可能なゲーム</h2>
        <span className="text-sm text-gray-600">{games.length}件</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
