import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

export type PlayerLeague = "NFL" | "CFB";

export function usePlayerById(
  playerId?: number,
  league: PlayerLeague = "NFL"
) {
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
            ? `${BASE_URL}/api/explore/players/cfb/player-id/${playerId}`
            : `${BASE_URL}/api/explore/players/nfl/player-id/${playerId}`;

        const res = await axios.get(url, {
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
