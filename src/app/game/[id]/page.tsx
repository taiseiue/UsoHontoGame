import { GamePage } from '@/components/pages/GamePage';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ participantId?: string }>;
}

/**
 * Game Session Page
 * Main game page for a specific session
 */
export default async function Game({ params, searchParams }: PageProps) {
  const { id: sessionId } = await params;
  const { participantId } = await searchParams;

  if (!participantId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">参加者IDが指定されていません</p>
          <a href="/" className="text-blue-600 hover:underline">
            トップページに戻る
          </a>
        </div>
      </div>
    );
  }

  return <GamePage sessionId={sessionId} participantId={participantId} />;
}
