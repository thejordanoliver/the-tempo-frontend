import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "utils/apiClient";

type League = "NFL" | "CFB";


export function useFootballPlayer(playerId: string | number, league: League) {
  const [player, setPlayer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = typeof playerId === "string" ? parseInt(playerId, 10) : playerId;

    if (!id || id <= 0) {
      setPlayer(null);
      setLoading(false);
      return;
    }

    const fetchPlayer = async () => {
      setLoading(true);
      setError(null);

      try {
        const endpoint =
          league === "NFL"
            ? `/api/nfl/players/player-id/${id}`
            : `/api/cfb/players/player-id/${id}`;

        const { data } = await axios.get(`${BASE_URL}${endpoint}`);

        setPlayer(data.player);
      } catch (err: any) {
        setError(err.message || "Failed to fetch player");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [playerId, league]);

  return { player, loading, error };
}
