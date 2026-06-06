import axios from "axios";
import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export type PlayerLeague =
  | "NBA"
  | "NFL"
  | "CFB"
  | "CBB"
  | "WCBB"
  | "MLB"
  | "NHL"
  | "WNBA";

export function usePlayerById(playerId?: number, league: PlayerLeague = "NFL") {
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) return;

    const controller = new AbortController();

    async function fetchPlayer() {
      try {
        setLoading(true);
        setError(null);

        const url =
          league === "NBA"
            ? `api/roster/player/${playerId}`
            : league === "CFB"
              ? `api/roster/cfb/player/${playerId}`
              : league === "CBB"
                ? `api/roster/cbb/player/${playerId}`
                : league === "WCBB"
                  ? `api/roster/wcbb/player/${playerId}`
                  : league === "MLB"
                    ? `api/roster/mlb/player/${playerId}`
                  : league === "NHL"
                    ? `api/roster/nhl/player/${playerId}`
                    : league === "WNBA"
                      ? `api/roster/wnba/player/${playerId}`
                      : `api/roster/nfl/player/${playerId}`;

        const res = await apiClient.get(url, {
          signal: controller.signal,
        });

        setPlayer(res.data.player);
      } catch (err: any) {
        if (axios.isCancel(err)) return;

        console.error("Player fetch error:", err);
        setError("Failed to load player");
      } finally {
        setLoading(false);
      }
    }

    fetchPlayer();

    return () => controller.abort();
  }, [playerId, league]);

  return {
    player,
    loading,
    error,
  };
}
