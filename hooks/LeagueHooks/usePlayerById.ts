import { isCancel } from "axios";
import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export function usePlayerById(playerId?: number, league: string = "NFL") {
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
          league === "nba"
            ? `api/roster/player/${playerId}`
            : `api/roster/${league}/player/${playerId}`;

        const res = await apiClient.get(url, {
          signal: controller.signal,
        });

        setPlayer(res.data.player);
      } catch (err: any) {
        if (isCancel(err)) return;

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
