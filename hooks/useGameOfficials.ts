import axios from "axios";
import { useEffect, useState } from "react";

export interface Official {
  fullName: string;
  displayName: string;
  position: {
    name: string;
    displayName: string;
    id: string;
  };
  order: number;
}

export interface Injury {
  team?: {
    id?: string;
    displayName?: string;
    abbreviation?: string;
  };
  athletes?: {
    fullName: string;
    shortName?: string;
    position?: { displayName?: string };
    status?: { type?: string; description?: string };
  }[];
}

interface UseGameOfficials {
  officials: Official[];
  injuries: Injury[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches game officials & injuries from ESPN.
 * Works for both NBA and College Basketball.
 */
export const useGameOfficials = (
  league: "nba" | "cbb",
  awayTeamId?: string | number,
  homeTeamId?: string | number,
  date?:
    | string
    | { date?: string; utc?: string; timestamp?: number }
    | undefined
): UseGameOfficials => {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!league || !awayTeamId || !homeTeamId || !date) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 🗓 Normalize the target date
        let targetDate: Date | null = null;
        if (typeof date === "string") targetDate = new Date(date);
        else if (typeof date === "object") {
          targetDate = date.timestamp
            ? new Date(date.timestamp * 1000)
            : date.utc
              ? new Date(date.utc)
              : date.date
                ? new Date(date.date)
                : null;
        }
        if (!targetDate) return;

        const makeYMD = (d: Date) =>
          d.toISOString().slice(0, 10).replace(/-/g, "");

        const datesToCheck = [
          makeYMD(new Date(targetDate.getTime() - 24 * 60 * 60 * 1000)),
          makeYMD(targetDate),
          makeYMD(new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)),
        ];

        let foundGame: any = null;

        // 🎯 Set league-specific ESPN endpoints
        const sportPath =
          league === "nba"
            ? "basketball/nba"
            : "basketball/mens-college-basketball";

        // 🔍 Try each nearby date
        for (const yyyymmdd of datesToCheck) {
          const scoreboardUrl = `https://site.api.espn.com/apis/site/v2/sports/${sportPath}/scoreboard?dates=${yyyymmdd}&limit=500`;
          const res = await axios.get(scoreboardUrl);
          const games = res.data.events || [];

          const game = games.find((g: any) => {
            const competitors = g.competitions?.[0]?.competitors || [];
            const ids = competitors.map((c: any) => String(c?.team?.id));
            return (
              ids.includes(String(homeTeamId)) &&
              ids.includes(String(awayTeamId))
            );
          });

          if (game) {
            foundGame = game;
            break;
          }
        }

        if (!foundGame) {
          setError("Game not found on ESPN");
          setOfficials([]);
          setInjuries([]);
          return;
        }

        const gameId =
          foundGame?.competitions?.[0]?.id ?? foundGame?.id ?? null;
        if (!gameId) throw new Error("Could not determine valid game ID.");

        const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/${sportPath}/summary?event=${gameId}`;
        const { data: summary } = await axios.get(summaryUrl);

        setOfficials(summary?.gameInfo?.officials ?? []);
        setInjuries(summary?.injuries ?? []);
      } catch (err: any) {
        console.error(`❌ Error fetching ${league} officials/injuries:`, err);
        setError(err.message || "Failed to fetch data");
        setOfficials([]);
        setInjuries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [league, awayTeamId, homeTeamId, date]);

  return { officials, injuries, loading, error };
};
