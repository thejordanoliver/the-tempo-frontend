import axios from "axios";
import { useEffect, useMemo, useState } from "react";

function parseDateString(d: string) {
  const isoMatch = /^\d{4}-\d{1,2}-\d{1,2}/.test(d);
  if (isoMatch) return new Date(d);

  const mdMatch = /^(\d{1,2})\/(\d{1,2})$/.exec(d);
  if (mdMatch) {
    const year = new Date().getFullYear();
    const month = mdMatch[1].padStart(2, "0");
    const day = mdMatch[2].padStart(2, "0");
    return new Date(`${year}-${month}-${day}`);
  }

  const parsed = Date.parse(d);
  if (!isNaN(parsed)) return new Date(parsed);

  console.warn("Cannot parse date:", d);
  return null;
}

type LeagueType =
  | "nba"
  | "mens-college-basketball"
  | "womens-college-basketball"
  | "mlb";

export const useGameBroadcasts = (
  homeId: number,
  awayId: number,
  date:
    | string
    | { date?: string; utc?: string; timestamp?: number }
    | undefined,
  league: LeagueType = "nba"
) => {
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedDate = useMemo(() => {
    if (!date) return "";
    if (typeof date === "string") return date;
    if (date.timestamp) return String(date.timestamp);
    if (date.utc) return date.utc;
    if (date.date) return date.date;
    return "";
  }, [date]);

  useEffect(() => {
    if (!homeId || !awayId || !normalizedDate) return;

    let cancelled = false;

    const fetchBroadcasts = async () => {
      setLoading(true);
      setError(null);

      try {
        let targetDate: Date | null = null;

        if (typeof date === "string") targetDate = parseDateString(date);
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

        const makeYMD = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");

        const datesToCheck = [
          makeYMD(new Date(targetDate.getTime() - 86400000)), // yesterday
          makeYMD(targetDate), // today
          makeYMD(new Date(targetDate.getTime() + 86400000)), // tomorrow
        ];

        const leaguePath =
          league === "mens-college-basketball"
            ? "basketball/mens-college-basketball"
            : league === "mlb"
            ? "baseball/mlb"
            : "basketball/nba";

        const params =
          league === "mens-college-basketball"
            ? "&groups=50&limit=500"
            : league === "mlb"
            ? "&limit=200"
            : "&limit=300";

        let foundGame: any = null;

        for (const yyyymmdd of datesToCheck) {
          const scoreboardUrl = `https://site.api.espn.com/apis/site/v2/sports/${leaguePath}/scoreboard?dates=${yyyymmdd}${params}`;
          const scoreboardRes = await axios.get(scoreboardUrl);
          const games = scoreboardRes.data.events || [];

          const game = games.find((g: any) => {
            const competitors = g.competitions?.[0]?.competitors || [];
            const ids = competitors.map((c: any) => Number(c.team?.id));

            return ids.includes(homeId) && ids.includes(awayId);
          });

          if (game) {
            foundGame = game;
            break;
          }
        }

        if (!foundGame) {
          if (!cancelled) {
            setError("Game not found on ESPN");
            setBroadcasts([]);
          }
          return;
        }

        const eventBroadcasts = foundGame.competitions?.[0]?.broadcasts || [];
        if (!cancelled) setBroadcasts(eventBroadcasts);
      } catch (err: any) {
        console.error("Error fetching broadcasts:", err);
        if (!cancelled) setError(err.message || "Failed to fetch broadcasts");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBroadcasts();

    return () => {
      cancelled = true;
    };
  }, [homeId, awayId, normalizedDate, league]);

  return { broadcasts, loading, error };
};

