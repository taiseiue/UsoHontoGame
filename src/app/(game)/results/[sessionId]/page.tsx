import { use } from 'react';
import dynamic from 'next/dynamic';

// Lazy load ResultsPage with confetti animation for better bundle size
const ResultsPage = dynamic(() => import('@/components/pages/ResultsPage').then(mod => ({ default: mod.ResultsPage })), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
        <p className="text-gray-600">Loading results...</p>
      </div>
    </div>
  ),
});

interface ResultsRouteParams {
  params: Promise<{
    sessionId: string;
  }>;
}

/**
 * Results route page
 *
 * Displays final game results for a completed session
 */
export default function ResultsRoute({ params }: ResultsRouteParams) {
  const { sessionId } = use(params);

  return <ResultsPage sessionId={sessionId} />;
}
