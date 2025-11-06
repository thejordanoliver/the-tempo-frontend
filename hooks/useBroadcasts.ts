import { useEffect, useState, useMemo } from "react";
import axios from "axios";

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

type LeagueType = "nba" | "mens-college-basketball";

export const useGameBroadcasts = (
  home: string,
  away: string,
  date: string | { date?: string; utc?: string; timestamp?: number } | undefined,
  league: LeagueType = "nba" // 👈 default to NBA
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
    if (!home || !away || !normalizedDate) return;

    let cancelled = false;

    const fetchBroadcasts = async () => {
      setLoading(true);
      setError(null);

      try {
        let targetDate: Date | null = null;
        if (typeof date === "string") {
          targetDate = parseDateString(date);
        } else if (typeof date === "object") {
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

        // 👇 Choose ESPN path and parameters per league
        const leaguePath =
          league === "mens-college-basketball"
            ? "basketball/mens-college-basketball"
            : "basketball/nba";

        // ESPN group codes and limits vary by league
        const params =
          league === "mens-college-basketball"
            ? "&groups=50&limit=500" // 50 = NCAA Division I Men
            : "&limit=300"; // NBA doesn’t need groups

        for (const yyyymmdd of datesToCheck) {
          const scoreboardUrl = `https://site.api.espn.com/apis/site/v2/sports/${leaguePath}/scoreboard?dates=${yyyymmdd}${params}`;
          const scoreboardRes = await axios.get(scoreboardUrl);
          const games = scoreboardRes.data.events || [];

          const game = games.find((g: any) => {
            const competitors = g.competitions?.[0]?.competitors || [];
            const teamNames = competitors.flatMap((c: any) => [
              c.team.abbreviation?.toLowerCase(),
              c.team.displayName?.toLowerCase(),
              c.team.shortDisplayName?.toLowerCase(),
              c.team.name?.toLowerCase(),
            ]);
            const normalize = (s: string) => s.toLowerCase();

            return (
              teamNames.some((n: string) => n && n.includes(normalize(home))) &&
              teamNames.some((n: string) => n && n.includes(normalize(away)))
            );
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
  }, [home, away, normalizedDate, league]);

  return { broadcasts, loading, error };
};
