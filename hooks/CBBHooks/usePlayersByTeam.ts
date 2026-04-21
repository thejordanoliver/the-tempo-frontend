import { useCallback, useEffect, useState } from "react";
import { BasketballPlayer } from "types/basketball";
import { apiClient } from "utils/apiClient";

interface PlayersResponse {
  teamId: number;
  count: number;
  players: BasketballPlayer[];
  isWomen: boolean;
  league: "cbb" | "wcbb" | "wnba";
}

export default function usePlayersByTeam(
  teamId: string | number,
  isWomen: boolean = false,
  isWNBA: boolean = false,
) {
  const [players, setPlayers] = useState<BasketballPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leagueKey = isWNBA ? "wnba" : isWomen ? "wcbb" : "cbb";

  const fetchPlayers = useCallback(async () => {
    if (!teamId) {
      setPlayers([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);

    try {
      const res = await apiClient.get<PlayersResponse>(
        `api/${leagueKey}/players/team/${teamId}`,
      );

      setPlayers(res.data.players || []);
      setError(null);
    } catch (err: any) {
      console.error(
        "Failed to fetch players",
        err.response?.data ?? err.message ?? err,
      );
      setError("Could not load team roster.");
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }, [teamId, leagueKey]);

  const refreshPlayers = useCallback(async () => {
    if (!teamId) return;

    setRefreshing(true);

    try {
      const res = await apiClient.get<PlayersResponse>(
        `api/${leagueKey}/players/team/${teamId}`,
      );

      setPlayers(res.data.players || []);
      setError(null);
    } catch (err: any) {
      console.error(
        "Failed to refresh players",
        err.response?.data ?? err.message ?? err,
      );
      setError("Could not refresh team roster.");
    } finally {
      setRefreshing(false);
    }
  }, [teamId, leagueKey]);

  const onRefresh = useCallback(() => {
    return refreshPlayers();
  }, [refreshPlayers]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  return {
    players,
    loading,
    refreshing,
    error,
    refreshPlayers,
    onRefresh,
  };
}