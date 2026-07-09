import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export interface Player {
  id: number;
  player_id: number;
  team_id: number;
  full_name: string;
  short_name: string;
  first_name: string;
  last_name: string;
  position: string | null;
  height: string | null;
  weight: number | null;
  birth_date: string | null;
  college: string | null;
  jersey_number: string;
  headshot_url: string;
  created_at: string;
  updated_at: string;
  active: boolean;
  affiliation: string;
  experience?: number;
  experience_display?: string;
  experience_abbr?: string;
  birth_display?: string;
  draft_round: number | null;
  draft_year: number | null;
  draft_number: number | null;
  espn_id: number | null;
}

export default function useRoster(teamId: number, league: string) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPlayers = useCallback(async () => {
    if (!teamId || !league) {
      setPlayers([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const url = `api/roster/${league}/${teamId}`;

    try {
      const res = await apiClient.get(url);

      const roster = Array.isArray(res.data?.players)
        ? res.data.players
        : Array.isArray(res.data)
          ? res.data
          : [];

      setPlayers(roster);
      setError(null);
    } catch (err: any) {
      const status = err?.response?.status;

      // Treat "not found" roster responses as an empty roster,
      // not a real frontend error.
      if (status === 404) {
        setPlayers([]);
        setError(null);
        return;
      }

      console.error("Could not load team roster:", err?.message || err);

      setPlayers([]);
      setError("Could not load team roster.");
    } finally {
      setLoading(false);
    }
  }, [teamId, league]);

  useEffect(() => {
    refreshPlayers();
  }, [refreshPlayers]);

  return {
    players,
    loading,
    error,
    refreshPlayers,
  };
}