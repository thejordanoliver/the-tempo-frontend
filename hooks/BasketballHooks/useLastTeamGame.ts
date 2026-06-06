import { useCallback, useEffect, useState } from "react";
import { BasketballGame } from "types/basketball";
import { apiClient } from "utils/apiClient";
import { getCBBSeason, getWNBASeason } from "utils/dateUtils";

// Leagues
const MEN_CBB_LEAGUE = "116";
const WOMEN_CBB_LEAGUE = "423";
const WNBA_LEAGUE = "13";

type UseLastTeamGameOptions = {
  teamId: number | string;
  isWNBA?: boolean;
  isWomen?: boolean;
};

export function useLastTeamGame({
  teamId,
  isWNBA = false,
  isWomen = false,
}: UseLastTeamGameOptions) {
  const [game, setGame] = useState<BasketballGame | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const season = isWNBA ? getWNBASeason() : getCBBSeason();

  const league = isWNBA
    ? WNBA_LEAGUE
    : isWomen
      ? WOMEN_CBB_LEAGUE
      : MEN_CBB_LEAGUE;

  const fetchLastGame = useCallback(async () => {
    if (!teamId) {
      setGame(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get(
        `/api/games/basketball/team/${teamId}/last`,
        {
          params: { season, league },
        },
      );

      if (res.data?.results > 0) {
        setGame(res.data.response);
      } else {
        setGame(null);
      }
    } catch (err: any) {
      console.error("Error fetching last basketball game:", err?.message);
      setError("Failed to load last game");
      setGame(null);
    } finally {
      setLoading(false);
    }
  }, [teamId, season, league]);

  useEffect(() => {
    fetchLastGame();
  }, [fetchLastGame]);

  return {
    game,
    loading,
    error,
    refresh: fetchLastGame,
  };
}
