import axios from "axios";
import { useEffect, useState } from "react";

import { apiClient, BASE_URL } from "utils/apiClient";

export type PlayerSeasonStat = {
  value: string | null;
  statId: string;
  displayName: string;
  abbreviation: string;
};

export type CareerStats = {
  [season: string]: {
    team: {
      id: number | null;
      abbr: string;
    };
    stats: {
      [group: string]: PlayerSeasonStat[];
    };
    league?: {
      name: string;
      fullName: string;
      shortName: string;
      displayAbbr: string;
    };
    seasonPhase?: string;
  };
};

export type PlayerSeasonsResponse = {
  playerId: number;
  name: string;
  position: string;
  positions: string[];
  careerStats: CareerStats;
  lastUpdated: string | null;
};

export interface Props {
  playerId: number;
}

export function useNFLPlayerSeasons(playerId?: number) {
  const [player, setPlayer] = useState<PlayerSeasonsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) return;

    let cancelled = false;

    async function fetchPlayerSeasons() {
      setLoading(true);
      setError(null);

      try {
        const { data } = await apiClient.get<PlayerSeasonsResponse>(
          `api/players/nfl/${playerId}/seasons`,
        );

        if (!cancelled) {
          setPlayer(data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.response?.data?.error ||
              err.message ||
              "Failed to fetch player seasons",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPlayerSeasons();

    return () => {
      cancelled = true;
    };
  }, [playerId]);

  return {
    player,
    careerStats: player?.careerStats ?? {},
    loading,
    error,
  };
}
