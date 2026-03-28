import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { CBBGame } from "types/types";
import { getCBBSeason } from "utils/dateUtils";

import { BASE_URL } from "utils/apiClient";

const MEN_CBB_LEAGUE = "116";
const WOMEN_CBB_LEAGUE = "423";

type UseCBBTeamGamesOptions = {
  season?: string;
  isWomen?: boolean;
};

export function useCBBTeamGames(
  teamId: string | number,
  { season = getCBBSeason(), isWomen = false }: UseCBBTeamGamesOptions = {},
) {
  const [games, setGames] = useState<CBBGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const league = isWomen ? WOMEN_CBB_LEAGUE : MEN_CBB_LEAGUE;

  const fetchGames = useCallback(async () => {
    if (!teamId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${BASE_URL}/api/games/cbb/team/${teamId}`, {
        params: {
          season,
          league,
        },
      });

      const rawGames: CBBGame[] = res.data.response || [];

      // ✅ Just return raw API response
      setGames(rawGames);
    } catch (err: any) {
      console.error("Error fetching CBB team games:", err.message);
      setError("Failed to load team games");
    } finally {
      setLoading(false);
    }
  }, [teamId, season, league]);
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const refreshGames = useCallback(() => {
    fetchGames();
  }, [fetchGames]);

  return { games, loading, error, refreshGames };
}
