import { useCallback, useEffect, useState } from "react";
import { BasketballGame } from "types/basketball";
import { apiClient } from "utils/apiClient";
import { getWNBASeason } from "utils/dateUtils";

type UseLastTeamGameOptions = {
  season?: string;
};

export function useLastTeamGame({
  teamId,
  season = getWNBASeason(),
}: {
  teamId?: number;
} & UseLastTeamGameOptions) {
  const [lastGame, setLastGame] = useState<BasketballGame | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLastGame = useCallback(async () => {
    if (!teamId) {
      setLastGame(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get(`/api/games/wnba/team/${teamId}/last`, {
        params: { season },
      });

      if (res.data?.results > 0) {
        setLastGame(res.data.response);
      } else {
        setLastGame(null);
      }
    } catch (err: any) {
      console.error("Error fetching last WNBA game:", err?.message);
      setError("Failed to load last game");
      setLastGame(null);
    } finally {
      setLoading(false);
    }
  }, [teamId, season]);

  useEffect(() => {
    fetchLastGame();
  }, [fetchLastGame]);

  return {
    lastGame,
    loading,
    error,
    refresh: fetchLastGame,
  };
}
