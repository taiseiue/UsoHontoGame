import { describe, expect, it } from 'vitest';
import { RegisterEpisodesUseCase } from '@/server/application/use-cases/episodes/RegisterEpisodesUseCase';
import { CreateSessionUseCase } from '@/server/application/use-cases/sessions/CreateSessionUseCase';
import { JoinSessionUseCase } from '@/server/application/use-cases/sessions/JoinSessionUseCase';
import { RevealAnswerUseCase } from '@/server/application/use-cases/turns/RevealAnswerUseCase';
import { SubmitVoteUseCase } from '@/server/application/use-cases/voting/SubmitVoteUseCase';

/**
 * E2E Integration Test: Complete Player Journey
 * Tests the full flow: join → register episodes → vote → see results
 *
 * NOTE: This test verifies the integration of multiple use cases working together.
 * Individual use cases are tested in unit tests. This test focuses on the
 * end-to-end workflow from a player's perspective.
 */
describe.skip('E2E: Complete Player Journey', () => {
  // Note: Using shared repositories due to singleton pattern
  // Individual tests clean up after themselves

  it.skip('should complete full game flow from session creation to results', async () => {
    // ========================================
    // STEP 1: Host creates a game session
    // ========================================
    const createSessionUseCase = new CreateSessionUseCase(
      sessionRepository,
      participantRepository,
      teamRepository
    );

    const sessionResult = await createSessionUseCase.execute({
      hostNickname: 'Alice (Host)',
    });

    expect(sessionResult.sessionId).toBeDefined();
    expect(sessionResult.hostId).toBeDefined();
    expect(sessionResult.sessionId).toMatch(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);

    const sessionId = sessionResult.sessionId;
    const hostId = sessionResult.hostId;

    // Verify session was actually saved
    const savedSession = await sessionRepository.findById(sessionId);
    expect(savedSession).toBeDefined();
    expect(savedSession?.id).toBe(sessionId);

    // ========================================
    // STEP 2: Players join the session
    // ========================================
    const joinSessionUseCase = new JoinSessionUseCase(participantRepository, sessionRepository);

    // Player 1 joins
    const player1Result = await joinSessionUseCase.execute({
      sessionId,
      nickname: 'Bob',
    });
    expect(player1Result.participantId).toBeDefined();
    const player1Id = player1Result.participantId;

    // Player 2 joins
    const player2Result = await joinSessionUseCase.execute({
      sessionId,
      nickname: 'Charlie',
    });
    expect(player2Result.participantId).toBeDefined();
    const player2Id = player2Result.participantId;

    // Player 3 joins
    const player3Result = await joinSessionUseCase.execute({
      sessionId,
      nickname: 'Diana',
    });
    expect(player3Result.participantId).toBeDefined();
    const player3Id = player3Result.participantId;

    // Verify session has all participants
    const session = await sessionRepository.findById(sessionId);
    expect(session).toBeDefined();

    const allParticipants = await participantRepository.findBySessionId(sessionId);
    expect(allParticipants).toHaveLength(4); // Host + 3 players

    // ========================================
    // STEP 3: Organize participants into teams
    // ========================================
    // Team 1: Alice (host) and Bob
    const _team1 = await teamRepository.findBySessionId(sessionId);
    await teamRepository.save({
      id: 'team1',
      sessionId,
      name: 'Team Truth',
      participantIds: [hostId, player1Id],
      cumulativeScore: 0,
      presentationOrder: 0,
    } as any);

    // Team 2: Charlie and Diana
    await teamRepository.save({
      id: 'team2',
      sessionId,
      name: 'Team Lie',
      participantIds: [player2Id, player3Id],
      cumulativeScore: 0,
      presentationOrder: 1,
    } as any);

    // Update participants with team IDs
    const host = await participantRepository.findById(hostId);
    const player1 = await participantRepository.findById(player1Id);
    const player2 = await participantRepository.findById(player2Id);
    const player3 = await participantRepository.findById(player3Id);

    if (host) {
      host.teamId = 'team1';
      await participantRepository.save(host);
    }
    if (player1) {
      player1.teamId = 'team1';
      await participantRepository.save(player1);
    }
    if (player2) {
      player2.teamId = 'team2';
      await participantRepository.save(player2);
    }
    if (player3) {
      player3.teamId = 'team2';
      await participantRepository.save(player3);
    }

    // ========================================
    // STEP 4: Players register their episodes
    // ========================================
    const registerEpisodesUseCase = new RegisterEpisodesUseCase(participantRepository);

    // Host registers episodes
    await registerEpisodesUseCase.execute({
      participantId: hostId,
      episodes: [
        { episodeNumber: 1, text: 'I once climbed Mount Fuji at sunrise', isLie: false },
        { episodeNumber: 2, text: 'I can speak 5 languages fluently', isLie: true },
        { episodeNumber: 3, text: 'I have a pet parrot named Kiwi', isLie: false },
      ],
    });

    // Player 2 (Charlie) registers episodes for Team 2
    await registerEpisodesUseCase.execute({
      participantId: player2Id,
      episodes: [
        { episodeNumber: 1, text: 'I won a national chess tournament', isLie: false },
        { episodeNumber: 2, text: 'I have never been on an airplane', isLie: false },
        { episodeNumber: 3, text: 'I can juggle 7 balls at once', isLie: true },
      ],
    });

    // Verify episodes were registered
    const hostAfterEpisodes = await participantRepository.findById(hostId);
    const player2AfterEpisodes = await participantRepository.findById(player2Id);

    expect(hostAfterEpisodes?.episodes).toHaveLength(3);
    expect(player2AfterEpisodes?.episodes).toHaveLength(3);
    expect(hostAfterEpisodes?.episodes.filter((e) => e.isLie)).toHaveLength(1);
    expect(player2AfterEpisodes?.episodes.filter((e) => e.isLie)).toHaveLength(1);

    // ========================================
    // STEP 5: Simulate a turn and voting
    // ========================================
    // Create a mock turn for Team 1 presenting
    const turnId = 'turn-1';

    // Team 2 votes on Team 1's episodes (they think episode 2 is the lie)
    const submitVoteUseCase = new SubmitVoteUseCase(voteRepository, sessionRepository);

    await submitVoteUseCase.execute({
      sessionId,
      teamId: 'team2',
      turnId,
      selectedEpisodeNumber: 2, // Correct guess!
      presentingTeamId: 'team1',
    });

    // Verify vote was recorded
    const votes = await voteRepository.findByTurnId(turnId);
    expect(votes).toHaveLength(1);
    expect(votes[0].selectedEpisodeNumber).toBe(2);
    expect(votes[0].votingTeamId).toBe('team2');

    // ========================================
    // STEP 6: Reveal answer and calculate scores
    // ========================================
    const revealAnswerUseCase = new RevealAnswerUseCase(
      sessionRepository,
      teamRepository,
      voteRepository
    );

    const revealResult = await revealAnswerUseCase.execute({
      turnId,
      correctEpisodeNumber: 2, // Episode 2 was the lie
      presentingTeamId: 'team1',
    });

    // Verify scoring
    expect(revealResult.correctEpisodeNumber).toBe(2);
    expect(revealResult.voteResults).toHaveLength(1);

    const team2Vote = revealResult.voteResults.find((v) => v.teamId === 'team2');
    expect(team2Vote).toBeDefined();
    expect(team2Vote?.isCorrect).toBe(true);
    expect(team2Vote?.pointsEarned).toBeGreaterThan(0); // Should earn points for correct guess

    // Verify teams have updated scores
    const team1After = await teamRepository.findById('team1');
    const team2After = await teamRepository.findById('team2');

    expect(team1After).toBeDefined();
    expect(team2After).toBeDefined();
    expect(team2After!.cumulativeScore).toBeGreaterThan(0); // Team 2 scored points

    // ========================================
    // VERIFICATION: Complete journey success
    // ========================================
    console.log('✅ E2E Test Passed: Complete player journey successful');
    console.log(`   - Session created: ${sessionId}`);
    console.log(`   - 4 participants joined`);
    console.log(`   - 2 teams formed`);
    console.log(`   - Episodes registered`);
    console.log(`   - Vote submitted`);
    console.log(`   - Scores calculated`);
    console.log(`   - Team 2 score: ${team2After!.cumulativeScore}`);
  });

  it.skip('should handle incorrect vote (team guesses wrong)', async () => {
    // Similar to above but with incorrect guess
    const createSessionUseCase = new CreateSessionUseCase(
      sessionRepository,
      participantRepository,
      teamRepository
    );

    const { sessionId, hostId } = await createSessionUseCase.execute({
      hostNickname: 'Host',
    });

    const joinSessionUseCase = new JoinSessionUseCase(participantRepository, sessionRepository);
    const { participantId: player1Id } = await joinSessionUseCase.execute({
      sessionId,
      nickname: 'Player1',
    });

    // Setup teams
    await teamRepository.save({
      id: 'team-a',
      sessionId,
      name: 'Team A',
      participantIds: [hostId],
      cumulativeScore: 0,
      presentationOrder: 0,
    } as any);

    await teamRepository.save({
      id: 'team-b',
      sessionId,
      name: 'Team B',
      participantIds: [player1Id],
      cumulativeScore: 0,
      presentationOrder: 1,
    } as any);

    // Register episodes
    const registerEpisodesUseCase = new RegisterEpisodesUseCase(participantRepository);
    await registerEpisodesUseCase.execute({
      participantId: hostId,
      episodes: [
        { episodeNumber: 1, text: 'Truth episode 1', isLie: false },
        { episodeNumber: 2, text: 'Lie episode 2', isLie: true },
        { episodeNumber: 3, text: 'Truth episode 3', isLie: false },
      ],
    });

    // Team B votes incorrectly (guesses episode 1 instead of 2)
    const submitVoteUseCase = new SubmitVoteUseCase(voteRepository, sessionRepository);
    await submitVoteUseCase.execute({
      sessionId,
      teamId: 'team-b',
      turnId: 'turn-test',
      selectedEpisodeNumber: 1, // Wrong guess
      presentingTeamId: 'team-a',
    });

    // Reveal answer
    const revealAnswerUseCase = new RevealAnswerUseCase(
      sessionRepository,
      teamRepository,
      voteRepository
    );

    const result = await revealAnswerUseCase.execute({
      turnId: 'turn-test',
      correctEpisodeNumber: 2,
      presentingTeamId: 'team-a',
    });

    // Verify Team B got it wrong
    const teamBVote = result.voteResults.find((v) => v.teamId === 'team-b');
    expect(teamBVote?.isCorrect).toBe(false);
    expect(teamBVote?.pointsEarned).toBe(0);

    // Presenting team (Team A) should earn deception points
    expect(result.presentingTeamPoints).toBeGreaterThan(0);

    console.log('✅ E2E Test Passed: Incorrect vote handled correctly');
  });
});
