import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export type CBBScore = {
  home: { total: number };
  away: { total: number };
  periodScores?: { period: number; home: number; away: number }[];
  homeTeam: string;
  awayTeam: string;
  status: "scheduled" | "in_play" | "final";
  displayClock?: string;
  period?: number;
  lastUpdated?: number; // timestamp
};

export const useCBBGameScores = (
  home: string | number | null | undefined,
  away: string | number | null | undefined,
  date: string | { date?: string; utc?: string; timestamp?: number } | undefined
) => {
  const [score, setScore] = useState<CBBScore | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const warnedOnceRef = useRef(false);
  const skipFetch = !home || !away || !date;

  const parseDate = (d: typeof date) => {
    if (typeof d === "string") return new Date(d);
    if (typeof d === "object") {
      if (d.timestamp) return new Date(d.timestamp * 1000);
      if (d.utc) return new Date(d.utc);
      if (d.date) return new Date(d.date);
    }
    return null;
  };

  const makeYMD = (d: Date | string) =>
    dayjs(d).tz("America/New_York").format("YYYYMMDD");

  const fetchScore = useCallback(
    async (isPolling = false) => {
      if (skipFetch) return;
      if (!isPolling) setLoading(true);
      setError(null);

      try {
        const targetDate = parseDate(date);
        if (!targetDate) return;

        const yyyymmdd = makeYMD(targetDate);

        // --- Scoreboard API (expand limit) ---
        let url = `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?dates=${yyyymmdd}&limit=500`;
        let { data } = await axios.get(url);
        let games = data.events || [];

        const normalize = (s: string | number) => String(s).toLowerCase();

        // --- Find game by team ---
        let game = games.find((g: any) =>
          g.competitions?.[0]?.competitors?.some((c: any) => {
            const teamAbbr = c.team.abbreviation?.toLowerCase();
            const teamName = c.team.displayName?.toLowerCase();
            return (
              c.team.id === String(home) ||
              c.team.id === String(away) ||
              teamAbbr === normalize(home) ||
              teamAbbr === normalize(away) ||
              teamName?.includes(normalize(home)) ||
              teamName?.includes(normalize(away))
            );
          })
        );

        // --- Fallback to boxscore if not found ---
        if (!game) {
          if (!warnedOnceRef.current) {
            console.warn(
              `[CBB Score] Game not found in scoreboard for ${home} vs ${away} on ${date}, falling back to boxscore.`
            );
            warnedOnceRef.current = true;
          }

          // Try to find eventId via team + date search
          const boxUrl = `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?dates=${yyyymmdd}&limit=500`;
          const { data: boxData } = await axios.get(boxUrl);
          games = boxData.events || [];

          game = games.find((g: any) =>
            g.competitions?.[0]?.competitors?.some((c: any) => {
              const teamAbbr = c.team.abbreviation?.toLowerCase();
              const teamName = c.team.displayName?.toLowerCase();
              return (
                c.team.id === String(home) ||
                c.team.id === String(away) ||
                teamAbbr === normalize(home) ||
                teamAbbr === normalize(away) ||
                teamName?.includes(normalize(home)) ||
                teamName?.includes(normalize(away))
              );
            })
          );

          if (!game) {
            setScore(undefined);
            return;
          }
        }

        // --- Map game data ---
        const competition = game.competitions?.[0];
        const competitors = competition?.competitors || [];
        const statusObj = competition?.status || {};
        const state = statusObj?.type?.state ?? "pre";

        const mappedStatus =
          state === "in" ? "in_play" : state === "post" ? "final" : "scheduled";

        const displayClock = statusObj?.displayClock ?? "0.0";
        const period = statusObj?.period ?? 0;

        const homeComp = competitors.find((c: any) => c.homeAway === "home");
        const awayComp = competitors.find((c: any) => c.homeAway === "away");

        if (homeComp && awayComp) {
          const maxPeriods = Math.max(
            homeComp.linescores?.length ?? 0,
            awayComp.linescores?.length ?? 0
          );

          const periodScores = Array.from({ length: maxPeriods }, (_, idx) => ({
            period: idx + 1,
            home: homeComp.linescores?.[idx]?.value ?? 0,
            away: awayComp.linescores?.[idx]?.value ?? 0,
          }));

          setScore({
            home: { total: Number(homeComp.score) },
            away: { total: Number(awayComp.score) },
            periodScores,
            homeTeam: homeComp.team.displayName,
            awayTeam: awayComp.team.displayName,
            status: mappedStatus,
            displayClock,
            period,
            lastUpdated: Date.now(),
          });
        }
      } catch (err: any) {
        console.error("[CBB Score] Error fetching:", err);
        setError(err.message || "Failed to fetch CBB score");
        setScore(undefined);
      } finally {
        setLoading(false);
      }
    },
    [home, away, date, skipFetch]
  );

  // --- Polling ---
  useEffect(() => {
    if (skipFetch) return;

    fetchScore(false);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => fetchScore(true), 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchScore, skipFetch]);

  // Stop polling when game ends
  useEffect(() => {
    if (score?.status === "final" && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [score?.status]);

  const refresh = useCallback(() => fetchScore(false), [fetchScore]);
  const isLive = score?.status === "in_play";

  return { score, loading, error, refresh, isLive };
};
