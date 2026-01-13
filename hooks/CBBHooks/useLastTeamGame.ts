import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { CBBGame } from "types/types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const MEN_CBB_LEAGUE = "116";
const WOMEN_CBB_LEAGUE = "423";

type UseLastTeamGameOptions = {
  season?: string;
  isWomen?: boolean;
};

export function useLastTeamGame({
  teamId,
  season = "2025-2026",
  isWomen = false,
}: {
  teamId?: number;
} & UseLastTeamGameOptions) {
  const [lastGame, setLastGame] = useState<CBBGame | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const league = isWomen ? WOMEN_CBB_LEAGUE : MEN_CBB_LEAGUE;

  const fetchLastGame = useCallback(async () => {
    if (!teamId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        `${BASE_URL}/api/gamesCBB/team/${teamId}/last`,
        {
          params: { season, league },
        }
      );

      setLastGame(res.data.response ?? null);
    } catch (err: any) {
      console.error("Error fetching last CBB game:", err.message);
      setError("Failed to load last game");
    } finally {
      setLoading(false);
    }
  }, [teamId, season, league]);

  useEffect(() => {
    fetchLastGame();
  }, [fetchLastGame]);

  return { lastGame, loading, error, refresh: fetchLastGame };
}
