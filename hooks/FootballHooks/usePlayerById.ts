import axios from "axios";
import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export type PlayerLeague = "NFL" | "CFB" | "MLB" | "WNBA";

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
          league === "CFB"
            ? `/api/explore/players/cfb/player-id/${playerId}`
            : league === "MLB"
              ? `/api/explore/players/mlb/player-id/${playerId}`
              : league === "WNBA"
                ? `/api/explore/players/wnba/player-id/${playerId}`
                : `/api/explore/players/nfl/player-id/${playerId}`;

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
