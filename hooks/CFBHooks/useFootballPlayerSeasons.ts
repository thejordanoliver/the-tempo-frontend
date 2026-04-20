import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

type Stat = {
  name: string;
  value: number;
  displayValue: string;
};

type Category = {
  name: string;
  displayName: string;
  stats: Stat[];
};

type Season = {
  year: string;
  categories: Category[];
};

type PlayerSeasonsResponse = {
  id: number;
  playerId: number;
  name: string;
  position: string;
  careerStats: Record<string, any>;
};

export function useFootballPlayerSeasons(
  playerId: number,
  league: "CFB" | "NFL" = "CFB",
) {
  const [data, setData] = useState<Season[]>([]);
  const [player, setPlayer] = useState<{
    name: string;
    position: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) return;

    const fetchSeasons = async () => {
      try {
        setLoading(true);

        const res = await apiClient.get<PlayerSeasonsResponse>(
          `api/players/${league.toLowerCase()}/${playerId}/seasons`,
        );

        const json = res.data;

        // basic player info
        setPlayer({
          name: json.name,
          position: json.position,
        });

        // transform seasons
        const seasons: Season[] = Object.entries(json.careerStats || {}).map(
          ([year, seasonData]: [string, any]) => {
            const categories =
              seasonData?.team?.categories?.filter(
                (cat: Category) => cat?.stats?.length > 0,
              ) || [];

            return {
              year,
              categories,
            };
          },
        );

        setData(seasons);
      } catch (err: any) {
        setError(err.message || "Failed to fetch seasons");
      } finally {
        setLoading(false);
      }
    };

    fetchSeasons();
  }, [playerId, league]);

  return {
    data,
    player,
    loading,
    error,
  };
}
