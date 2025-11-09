'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

/**
 * Host Create Session Page
 * Allows host to create a new game session
 */
export default function HostCreatePage() {
  const router = useRouter();
  const [hostNickname, setHostNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostNickname: hostNickname.trim(),
          scoringRules: {
            pointsForCorrectGuess: 10,
            pointsPerDeception: 5,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create session');
      }

      const result = await response.json();

      // Redirect to management page
      router.push(`/manage/${result.sessionId}?hostId=${result.hostId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Create Game Session</h1>
          <p className="mb-6 text-sm text-gray-500">
            Start a new "Two Truths and a Lie" game session
          </p>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="hostNickname"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Your Nickname
              </label>
              <Input
                id="hostNickname"
                type="text"
                placeholder="Enter your nickname"
                value={hostNickname}
                onChange={(e) => setHostNickname(e.target.value)}
                disabled={loading}
                required
                minLength={1}
                maxLength={30}
                autoFocus
              />
              <p className="mt-1 text-xs text-gray-500">This will be displayed as the host name</p>
            </div>

            <div className="rounded-md bg-gray-50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-gray-700">Scoring Rules</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Correct guess: 10 points</li>
                <li>• Each deception: 5 points to presenting team</li>
              </ul>
            </div>

            <Button type="submit" fullWidth disabled={loading || !hostNickname.trim()}>
              {loading ? 'Creating...' : 'Create Session'}
            </Button>
          </form>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">What happens next?</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li>1. You'll receive a session code to share</li>
              <li>2. Participants join using the code</li>
              <li>3. Organize participants into teams</li>
              <li>4. Start the game when ready</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
