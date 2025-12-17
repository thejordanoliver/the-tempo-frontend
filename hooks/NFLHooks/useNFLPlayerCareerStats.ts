import axios from "axios";
import { useEffect, useState } from "react";

type StatItem = {
  name: string;
  value: string | number | null;
};

export type PlayerStat = Record<string, string | number | null> & {
  date?: string;
  opponent?: string;
  team?: string;
  gameId?: number;
};

export type SeasonStat = {
  season: string;
  games: PlayerStat[];
};

// ✅ Cache
const cache = new Map<string, SeasonStat[]>();

// ✅ Env keys
const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = process.env.EXPO_PUBLIC_FOOTBALL_RAPIDAPI_HOST || "";

export function usePlayerStatsBySeason(playerId: number, seasons: string[]) {
  const [data, setData] = useState<SeasonStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const filteredSeasons = seasons.filter((s) => {
    const year = parseInt(s, 10);
    return year >= 2021 && year <= 2025;
  });

  const cacheKey = `${playerId}-${filteredSeasons.join(",")}`;

  useEffect(() => {
    if (!playerId || filteredSeasons.length === 0) return;

    const fetchAll = async () => {
      if (cache.has(cacheKey)) {
        setData(cache.get(cacheKey)!);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const allStats: SeasonStat[] = [];

        for (const season of filteredSeasons) {
          const res = await axios.get<{ response: any[] }>(
            `https://${RAPIDAPI_HOST}/players/statistics`,
            {
              params: { id: playerId.toString(), season },
              headers: {
                "X-RapidAPI-Key": RAPIDAPI_KEY,
                "X-RapidAPI-Host": RAPIDAPI_HOST,
              },
            }
          );

          const seasonStats: PlayerStat[] = [];

          // ✅ Fix: each "response" entry corresponds to one player-season
          res.data.response.forEach((entry: any) => {
            entry.teams?.forEach((teamBlock: any) => {
              const teamName = teamBlock.team?.name || null;

              teamBlock.groups?.forEach((group: any) => {
                const groupName = group.name?.toLowerCase() || "";

                group.statistics?.forEach((stat: StatItem) => {
                  let key = stat.name.replace(/\s+/g, "_").toLowerCase();

                  // ✅ Normalize stat names for consistency
                  if (groupName === "passing" && key === "yards")
                    key = "yards_passing";
                  if (groupName === "rushing" && key === "yards")
                    key = "yards_rushing";

                  if (groupName === "passing" && key === "yards_per_game")
                    key = "yards_per_game_passing";
                  if (groupName === "rushing" && key === "yards_per_game")
                    key = "yards_per_game_rushing";

                  // ✅ Create one record per season (not per game)
                  let seasonRecord = seasonStats.find((s) => s.team === teamName);
                  if (!seasonRecord) {
                    seasonRecord = { team: teamName };
                    seasonStats.push(seasonRecord);
                  }

                  seasonRecord[key] =
                    typeof stat.value === "string"
                      ? Number(stat.value.replace(/,/g, "")) || 0
                      : stat.value;
                });
              });
            });
          });

          if (seasonStats.length > 0) {
            allStats.push({ season, games: seasonStats });
          }
        }

        cache.set(cacheKey, allStats);
        setData(allStats);
      } catch (err: any) {
        console.error("❌ Error fetching player stats:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [playerId, cacheKey]);

  return { data, loading, error };
}
