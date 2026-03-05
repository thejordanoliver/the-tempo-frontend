import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

/* ----------------------------- Types ----------------------------- */

interface TeamInfo {
  id: string;
  name: string;
  abbreviation: string;
}

export interface PlayerOfTheGame {
  playerId: string;
  name: string;
  shortName: string;
  position: string;
  jersey: string;
  starter: boolean;
  minutes: string;

  points: number;
  rebounds: number;
  assists: number;

  team: TeamInfo;

  rawStats: string[];
}

export interface GameRecapData {
  success: boolean;
  gameId: number;
  recap: string;
  playerOfTheGame: PlayerOfTheGame | null;
  meta: {
    generatedAt: string;
    source: string;
  };
}

/* ----------------------------- Hook ----------------------------- */

export function useGameRecap(gameId: number | string) {
  const [recapData, setRecapData] = useState<GameRecapData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) return;

    setLoading(true);
    setError(null);

    const fetchRecap = async () => {
      try {
        const { data } = await axios.get<GameRecapData>(
          `${BASE_URL}/api/recaps/${gameId}`
        );

        if (data.success) {
          setRecapData(data);
        } else {
          setError("Failed to fetch recap");
        }
      } catch (err: unknown) {
        console.error("❌ Fetch recap failed:", err);

        if (axios.isAxiosError(err)) {
          setError(
            (err.response?.data as any)?.error || err.message
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecap();
  }, [gameId]);

  return { recapData, loading, error };
}
