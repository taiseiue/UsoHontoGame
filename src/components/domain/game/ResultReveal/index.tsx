'use client';

export interface VoteResult {
  teamId: string;
  teamName: string;
  selectedEpisodeNumber: number;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface ResultRevealProps {
  correctEpisodeNumber: number;
  episodes: Array<{ episodeNumber: number; text: string }>;
  voteResults: VoteResult[];
  presentingTeamPoints: number;
  presentingTeamName: string;
  onContinue: () => void;
}

/**
 * ResultReveal
 * Displays the revealed answer and voting results
 */
export function ResultReveal({
  correctEpisodeNumber,
  episodes,
  voteResults,
  presentingTeamPoints,
  presentingTeamName,
  onContinue,
}: ResultRevealProps) {
  const correctEpisode = episodes.find((ep) => ep.episodeNumber === correctEpisodeNumber);
  const correctVotes = voteResults.filter((v) => v.isCorrect);
  const incorrectVotes = voteResults.filter((v) => !v.isCorrect);

  return (
    <div className="space-y-6">
      {/* Correct Answer Reveal */}
      <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-red-600 mb-2">正解発表!</h2>
          <p className="text-xl font-bold">エピソード{correctEpisodeNumber}が嘘でした</p>
        </div>
        <div className="bg-white p-4 rounded-lg">
          <div className="font-bold text-lg mb-2 text-red-600">
            エピソード{correctEpisodeNumber} (嘘)
          </div>
          <div className="text-gray-800">{correctEpisode?.text}</div>
        </div>
      </div>

      {/* Presenting Team Points */}
      <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold mb-2">{presentingTeamName}の獲得ポイント</h3>
        <div className="text-4xl font-bold text-blue-600">{presentingTeamPoints}点</div>
        <p className="text-sm text-gray-600 mt-2">
          {incorrectVotes.length}チームを騙すことに成功しました!
        </p>
      </div>

      {/* Vote Results */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">投票結果</h3>

        {correctVotes.length > 0 && (
          <div className="mb-6">
            <h4 className="font-bold text-green-600 mb-3">
              ✓ 正解したチーム ({correctVotes.length})
            </h4>
            <div className="space-y-2">
              {correctVotes.map((vote) => (
                <div
                  key={vote.teamId}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{vote.teamName}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      (エピソード{vote.selectedEpisodeNumber}に投票)
                    </span>
                  </div>
                  <span className="text-green-600 font-bold">+{vote.pointsEarned}点</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {incorrectVotes.length > 0 && (
          <div>
            <h4 className="font-bold text-red-600 mb-3">
              ✗ 不正解だったチーム ({incorrectVotes.length})
            </h4>
            <div className="space-y-2">
              {incorrectVotes.map((vote) => (
                <div
                  key={vote.teamId}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{vote.teamName}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      (エピソード{vote.selectedEpisodeNumber}に投票)
                    </span>
                  </div>
                  <span className="text-red-600 font-bold">0点</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="text-center">
        <button
          type="button"
          onClick={onContinue}
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
        >
          次のターンへ
        </button>
      </div>
    </div>
  );
}
