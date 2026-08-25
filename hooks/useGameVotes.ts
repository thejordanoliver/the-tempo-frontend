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
  gameId: number,
  options: { signal?: AbortSignal } = {},
): Promise<VoteResponse> => {
  const res = await apiClient.get(`/api/votes/${gameId}`, {
    signal: options.signal,
  });
  return {
    votes: res.data.votes ?? [],
    userVote: res.data.userVote ?? null,
  };
};
