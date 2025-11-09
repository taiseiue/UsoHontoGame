'use client';

export interface TurnDisplayProps {
  presentingTeamName: string;
  presentingPlayerName: string;
  episodes: Array<{ episodeNumber: number; text: string }>;
  phase: 'reading' | 'voting' | 'reveal';
}

/**
 * TurnDisplay
 * Displays the current turn information and episodes
 */
export function TurnDisplay({
  presentingTeamName,
  presentingPlayerName,
  episodes,
  phase,
}: TurnDisplayProps) {
  const phaseText = {
    reading: '発表中',
    voting: '投票中',
    reveal: '結果発表',
  };

  const phaseColor = {
    reading: 'bg-blue-100 text-blue-800',
    voting: 'bg-purple-100 text-purple-800',
    reveal: 'bg-green-100 text-green-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            {presentingTeamName} - {presentingPlayerName}のターン
          </h2>
          <p className="text-gray-600 mt-1">3つのエピソードのうち、1つは嘘です</p>
        </div>
        <div className={`px-4 py-2 rounded-full font-bold ${phaseColor[phase]}`}>
          {phaseText[phase]}
        </div>
      </div>

      <div className="space-y-4">
        {episodes.map((episode) => (
          <div
            key={episode.episodeNumber}
            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="font-bold text-lg mb-2 text-blue-600">
              エピソード{episode.episodeNumber}
            </div>
            <div className="text-gray-800">{episode.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
