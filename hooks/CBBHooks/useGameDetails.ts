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

export interface LeaderGroup {
  team: {
    id: string;
    displayName: string;
    abbreviation: string;
    logos?: { href: string }[];
  };
  leaders: {
    name: string; // "points" | "rebounds" | etc (varies by sport)
    displayName: string; // "Points", "Rebounds"
    leaders: {
      athlete: {
        id: string;
        fullName: string;
        displayName: string;
        shortName?: string;
        headshot?: string;
        position?: { abbreviation?: string };
        team?: { id: string };
      };
      value: number; // e.g., 27 points
    }[];
  }[];
}

interface UseGameDetails {
  officials: Official[];
  injuries: Injury[];
  highlights: any[];
  plays: any[];
  leaders: LeaderGroup[];
  neutralSite: boolean;
  timeouts: { home: number | null; away: number | null };
  loading: boolean;
  error: string | null;
}

/**
 * Fetches game officials, injuries, highlights, plays, timeouts, AND leaders from ESPN.
 * Works for both NBA and College Basketball.
 */
export const useGameDetails = (
  league: "nba" | "cbb",
  awayTeamId?: string | number,
  homeTeamId?: string | number,
  date?: string | { date?: string; utc?: string; timestamp?: number }
): UseGameDetails => {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [neutralSite, setNeutralSite] = useState<boolean>(false);
  const [plays, setPlays] = useState<any[]>([]);
  const [leaders, setLeaders] = useState<LeaderGroup[]>([]);
  const [timeouts, setTimeouts] = useState<{
    home: number | null;
    away: number | null;
  }>({
    home: null,
    away: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!league || !awayTeamId || !homeTeamId || !date) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Normalize date object/string
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
          makeYMD(new Date(targetDate.getTime() - 86400000)),
          makeYMD(targetDate),
          makeYMD(new Date(targetDate.getTime() + 86400000)),
        ];

        let foundGame: any = null;

        const sportPath =
          league === "nba"
            ? "basketball/nba"
            : "basketball/mens-college-basketball";

        const params = league === "cbb" ? "groups=50&limit=500" : "";

        // Find matching game
        for (const yyyymmdd of datesToCheck) {
          const scoreboardUrl = `https://site.api.espn.com/apis/site/v2/sports/${sportPath}/scoreboard?dates=${yyyymmdd}&${params}`;
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
          setHighlights([]);
          setPlays([]);
          setLeaders([]);
          setTimeouts({ home: null, away: null });
          return;
        }

        const gameId =
          foundGame?.competitions?.[0]?.id ?? foundGame?.id ?? null;
        if (!gameId) throw new Error("Could not determine valid game ID.");

        const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/${sportPath}/summary?event=${gameId}`;
        const { data: summary } = await axios.get(summaryUrl);

        const neutral =
          summary?.header?.competitions?.[0]?.neutralSite ?? false;

        setHighlights(summary?.videos ?? []);
        setOfficials(summary?.gameInfo?.officials ?? []);
        setInjuries(summary?.injuries ?? []);
        setPlays(summary?.plays ?? []);
        setNeutralSite(neutral);

        // ⭐️ NEW — set leaders
        setLeaders(summary?.leaders ?? []);

        // --- Extract timeouts ---
        const competitors =
          summary?.header?.competitions?.[0]?.competitors || [];
        const home = competitors.find((c: any) => c.homeAway === "home");
        const away = competitors.find((c: any) => c.homeAway === "away");

        setTimeouts({
          home: home?.timeoutsRemaining ?? null,
          away: away?.timeoutsRemaining ?? null,
        });
      } catch (err: any) {
        console.error(`❌ Error fetching ${league} game details:`, err);
        setError(err.message || "Failed to fetch data");
        setOfficials([]);
        setInjuries([]);
        setHighlights([]);
        setPlays([]);
        setLeaders([]);
        setTimeouts({ home: null, away: null });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [league, awayTeamId, homeTeamId, date]);

  return {
    officials,
    injuries,
    highlights,
    plays,
    neutralSite,
    leaders,
    timeouts,
    loading,
    error,
  };
};
