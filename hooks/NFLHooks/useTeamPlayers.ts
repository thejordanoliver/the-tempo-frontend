import axios from "axios";
import { useCallback, useEffect, useState } from "react";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export type TeamPlayer = {
  id: number;
  player_id: number;
  espn_id?: number | null;

  name: string;
  first_name?: string | null;
  last_name?: string | null;
  short_name?: string | null;

  position?: string | null;
  jersey_number?: number | null;
  avatarUrl?: string | null;

  team_id: number;
  team?: string | null;

  experience_display?: string | null;
  experience_abbr?: string | null;
  birth_display?: string | null;

  active: boolean;
  affiliation: "NFL" | "CFB";
};

export function useTeamPlayers(
  teamId?: number | string,
  league?: "NFL" | "CFB"
) {
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = useCallback(
    async (isRefresh = false) => {
      if (!teamId || !league) return;

      const url = `${BASE_URL}/api/explore/players/${league}/team/${teamId}`;

      try {
        isRefresh ? setRefreshing(true) : setLoading(true);
        setError(null);

        const res = await axios.get(url);
        setPlayers(res.data.players ?? []);
      } catch (err) {
        console.error("❌ useTeamPlayers error:", err);
        setError("Failed to load team players");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [teamId, league]
  );

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  return {
    players,
    loading,
    refreshing,
    error,
    refetch: () => fetchPlayers(true),
  };
}
