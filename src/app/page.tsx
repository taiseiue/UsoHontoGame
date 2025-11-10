import { createSessionAction, validateSessionAction } from '@/app/actions/session';
import { NicknameInput } from '@/components/domain/session/NicknameInput';

/**
 * TOP Page (Home)
 * Server Component that handles session validation and nickname setup
 * Shows nickname input if user doesn't have nickname set
 */
export default async function Home() {
  // Validate existing session
  let session = await validateSessionAction();

  // Create new session if none exists
  if (!session.valid) {
    const createResult = await createSessionAction();
    if (createResult.success) {
      session = await validateSessionAction();
    }
  }

  // Show nickname input if user doesn't have nickname
  if (!session.hasNickname) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <NicknameInput />
      </div>
    );
  }

  // User has session and nickname - show game list
  const { GetAvailableGames } = await import(
    '@/server/application/use-cases/games/GetAvailableGames'
  );
  const { InMemoryGameRepository } = await import(
    '@/server/infrastructure/repositories/InMemoryGameRepository'
  );
  const { GameList } = await import('@/components/domain/game/GameList');

  const gameRepository = InMemoryGameRepository.getInstance();
  const getGamesUseCase = new GetAvailableGames(gameRepository);
  const games = await getGamesUseCase.execute();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">ようこそ、{session.nickname}さん！</h1>
        </div>

        <GameList games={games} />
      </div>
    </div>
  );
}
