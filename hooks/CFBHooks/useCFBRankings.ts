import { useState, useEffect, useCallback } from "react";

// --- Team Rank type ---
export type CFBTeamRank = {
  current: number;
  previous: number;
  points: number;
  firstPlaceVotes: number;
  trend: string;
  recordSummary: string;
  team: {
    id: string;
    nickname: string;
    abbreviation: string;
    groups: {
      id: string;
      shortName: string;
      parent?: {
        id: string;
        shortName: string;
        isConference: boolean;
      };
      isConference: boolean;
    };
  } | null; // team can be null if missing
  date: string;
  lastUpdated: string;
};

// --- Poll type containing multiple team ranks ---
export type CFBRankPoll = {
  type: "ap" | "coaches";
  shortName: string;
  ranks: CFBTeamRank[];
  droppedOut: CFBTeamRank[]; // Added droppedOut
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

export const useCFBRankings = () => {
  const [rankings, setRankings] = useState<CFBRankPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/cfb-rankings`);
      const data = await res.json();

      // Ensure droppedOut exists
      const pollsWithDroppedOut: CFBRankPoll[] = (data.rankings || []).map(
        (poll: any) => ({
          ...poll,
          droppedOut: poll.droppedOut || [],
        })
      );

      setRankings(pollsWithDroppedOut);
    } catch (err: any) {
      setError(err.message || "Failed to fetch rankings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  return { rankings, loading, error, refresh: fetchRankings };
};
