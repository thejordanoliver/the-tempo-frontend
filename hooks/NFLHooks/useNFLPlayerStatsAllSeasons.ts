import axios from "axios";
import { useEffect, useState } from "react";

type StatItem = {
  name: string;
  value: string | number | null;
};

type PlayerStat = Record<string, string | number | null> & { date?: string };

type SeasonStat = {
  season: string;
  games: PlayerStat[];
};

const cache = new Map<string, SeasonStat[]>();

const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = process.env.EXPO_PUBLIC_FOOTBALL_RAPIDAPI_HOST || "";

export function usePlayerStatsBySeason(playerId: number, seasons: string[]) {
  const [data, setData] = useState<SeasonStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const filteredSeasons = seasons.filter(
    (s) => parseInt(s, 10) >= 2021 && parseInt(s, 10) <= 2023
  );

  const cacheKey = `${playerId}-${filteredSeasons.join(",")}`;

  useEffect(() => {
    if (!playerId || !filteredSeasons?.length) return;

    const fetchAll = async () => {
      if (cache.has(cacheKey)) {
        setData(cache.get(cacheKey)!);
        setLoading(false);
        return;
      }

      setLoading(true);

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

          res.data.response.forEach((playerData) => {
            playerData.teams.forEach((teamData: any) => {
              teamData.groups.forEach((group: any) => {
                group.statistics.forEach((stat: StatItem) => {
                  let gameStat = seasonStats.find(
                    (g) => g.date === playerData.game?.date
                  );

                  if (!gameStat) {
                    gameStat = { date: playerData.game?.date };
                    seasonStats.push(gameStat);
                  }

                  const key = stat.name.replace(/\s+/g, "_").toLowerCase();
                  gameStat[key] = stat.value;
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
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [cacheKey, playerId, filteredSeasons]);

  return { data, loading, error };
}
