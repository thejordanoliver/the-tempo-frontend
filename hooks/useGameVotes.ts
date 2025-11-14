import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type PollResult = {
  team_id: string | number;
  votes: number;
};

export type VoteResponse = {
  votes: PollResult[];
  userVote: string | number | null;
};

// Fetch vote results for a game
export const fetchVoteResults = async (gameId: string): Promise<VoteResponse> => {
  const token = await AsyncStorage.getItem("accessToken");
  const res = await axios.get(`${API_URL}/api/votes/${gameId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return {
    votes: res.data.votes ?? [],
    userVote: res.data.userVote ?? null,
  };
};

// Cast a vote for a team
export const castVoteApi = async (gameId: string, teamId: string | number) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (!token) throw new Error("You must be logged in to vote.");
  await axios.post(
    `${API_URL}/api/votes`,
    { gameId, teamId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
