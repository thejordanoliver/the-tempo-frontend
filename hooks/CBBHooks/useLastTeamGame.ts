import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { CBBGame } from "types/types";
import { getCBBSeason } from "utils/dateUtils";

import { BASE_URL } from "utils/apiClient";

const MEN_CBB_LEAGUE = "116";
const WOMEN_CBB_LEAGUE = "423";

type UseLastTeamGameOptions = {
  season?: string;
  isWomen?: boolean;
};

export function useLastTeamGame({
  teamId,
  season = getCBBSeason(),
  isWomen = false,
}: {
  teamId?: number;
} & UseLastTeamGameOptions) {
  const [lastGame, setLastGame] = useState<CBBGame | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const league = isWomen ? WOMEN_CBB_LEAGUE : MEN_CBB_LEAGUE;

  const fetchLastGame = useCallback(async () => {
    if (!teamId) {
      setLastGame(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        `${BASE_URL}/api/games/cbb/team/${teamId}/last`,
        {
          params: { season, league },
        },
      );

      // Backend returns: { league, results, response }
      if (res.data?.results > 0) {
        setLastGame(res.data.response);
      } else {
        setLastGame(null);
      }
    } catch (err: any) {
      console.error("Error fetching last CBB game:", err?.message);
      setError("Failed to load last game");
      setLastGame(null);
    } finally {
      setLoading(false);
    }
  }, [teamId, season, league]);

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
