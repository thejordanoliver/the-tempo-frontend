// hooks/useGameVotes.ts
// FIX: replaced manual AsyncStorage token reads + axios with apiClient.
//      apiClient attaches the Authorization header and handles token refresh
//      automatically — no manual token management needed here.
import { apiClient } from "utils/apiClient";

export type PollResult = {
  team_id: string | number;
  votes: number;
};

export type VoteResponse = {
  votes: PollResult[];
  userVote: string | number | null;
};

// Fetch vote results for a game
export const fetchVoteResults = async (
  gameId: string,
): Promise<VoteResponse> => {
  const res = await apiClient.get(`/api/votes/${gameId}`);
  return {
    votes: res.data.votes ?? [],
    userVote: res.data.userVote ?? null,
  };
};

// Cast a vote for a team
export const castVoteApi = async (
  gameId: string,
  teamId: string | number,
): Promise<void> => {
  await apiClient.post("/api/votes", { gameId, teamId });
};