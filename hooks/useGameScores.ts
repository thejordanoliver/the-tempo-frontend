import axios from "axios";
import dayjs from "dayjs";
import tz from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useCallback, useEffect, useRef, useState } from "react";

dayjs.extend(utc);
dayjs.extend(tz);

export type NBAScore = {
  home: { total: number };
  away: { total: number };
  periodScores?: { period: number; home: number; away: number }[];
  homeTeam: string;
  awayTeam: string;
  status: "scheduled" | "in_play" | "final";
  statusText?: string;
  displayClock?: string;
  period?: number;
  lastUpdated?: number;
  lastPlay?: {
    text: string;
    teamId?: string;
    homeWinPercentage?: number;
    athletes?: any[];
  };
};

export const useGameScores = (
  league: string,
  homeIdOrName: string | null | undefined,
  awayIdOrName: string | null | undefined,
  date?: string | { date?: string; utc?: string; timestamp?: number }
) => {
  const [score, setScore] = useState<NBAScore | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const warnedOnceRef = useRef(false);

  const skipFetch = !homeIdOrName || !awayIdOrName;
  const normalize = (s?: string) =>
    s?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";

  const fetchScore = useCallback(
    async (isPolling = false) => {
      if (skipFetch) return;
      if (!isPolling) setLoading(true);
      setError(null);

      try {
        // --- Determine base date ---
        let baseDate: dayjs.Dayjs;
        if (typeof date === "string") baseDate = dayjs(date);
        else if (typeof date === "object") {
          if (date.timestamp) baseDate = dayjs(date.timestamp * 1000);
          else if (date.utc) baseDate = dayjs(date.utc);
          else if (date.date) baseDate = dayjs(date.date);
          else baseDate = dayjs();
        } else baseDate = dayjs();

        // Use UTC for ESPN scoreboard queries
        const baseUtc = baseDate.utc();

        // Try day before, day of, and day after
        const datesToTry = [-1, 0, 1].map(offset =>
          baseUtc.add(offset, "day").format("YYYYMMDD")
        );

        let foundGame: any = null;
        const homeNorm = normalize(String(homeIdOrName));
        const awayNorm = normalize(String(awayIdOrName));

        for (const yyyymmdd of datesToTry) {
          const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/${league}/scoreboard?dates=${yyyymmdd}`;
          const { data } = await axios.get(url);
          const games = data.events || [];

          const findMatch = (list: any[]) => {
            for (const g of list) {
              const competitors = g.competitions?.[0]?.competitors || [];
              if (competitors.length !== 2) continue;

              const [teamA, teamB] = competitors.map((c: any) => ({
                id: String(c.team.id),
                abbrev: normalize(c.team.abbreviation),
                display: normalize(c.team.displayName),
                short: normalize(c.team.shortDisplayName),
                location: normalize(c.team.location),
                full: normalize(`${c.team.location}${c.team.shortDisplayName}`),
                homeAway: c.homeAway,
              }));

              // ID match
              if (
                (teamA.id === homeIdOrName && teamB.id === awayIdOrName) ||
                (teamA.id === awayIdOrName && teamB.id === homeIdOrName)
              )
                return g;

              // Name match
              const namesA = [teamA.abbrev, teamA.display, teamA.short, teamA.location, teamA.full];
              const namesB = [teamB.abbrev, teamB.display, teamB.short, teamB.location, teamB.full];

              if (
                (namesA.includes(homeNorm) && namesB.includes(awayNorm)) ||
                (namesA.includes(awayNorm) && namesB.includes(homeNorm))
              )
                return g;
            }
            return null;
          };

          foundGame = findMatch(games);
          if (foundGame) break;
        }

        if (!foundGame) {
          if (!warnedOnceRef.current) {
            console.warn(
              `[${league.toUpperCase()} Score] ❌ No match found for ${homeIdOrName} vs ${awayIdOrName} around UTC date ${baseUtc.format("YYYY-MM-DD HH:mm")}`
            );
            warnedOnceRef.current = true;
          }
          setScore(undefined);
          return;
        }

        // --- Parse score ---
        const competition = foundGame.competitions?.[0];
        const competitors = competition?.competitors || [];
        const statusObj = competition?.status || {};
        const state = statusObj?.type?.state ?? "pre";
        const mappedStatus =
          state === "in" ? "in_play" : state === "post" ? "final" : "scheduled";
        const statusText =
          statusObj?.type?.shortDetail || statusObj?.type?.description || "Scheduled";

        const displayClock = statusObj?.displayClock ?? "0.0";
        const period = statusObj?.period ?? 0;
        const homeComp = competitors.find((c: any) => c.homeAway === "home");
        const awayComp = competitors.find((c: any) => c.homeAway === "away");

        if (homeComp && awayComp) {
          const maxPeriods = Math.max(
            homeComp.linescores?.length ?? 0,
            awayComp.linescores?.length ?? 0
          );

          const periodScores = Array.from({ length: maxPeriods }, (_, i) => ({
            period: i + 1,
            home: homeComp.linescores?.[i]?.value ?? 0,
            away: awayComp.linescores?.[i]?.value ?? 0,
          }));

          const situation = competition?.situation;
          const lastPlay = situation?.lastPlay
            ? {
                text: situation.lastPlay.text,
                teamId: situation.lastPlay.team?.id,
                homeWinPercentage:
                  situation.lastPlay.probability?.homeWinPercentage ?? null,
                athletes:
                  situation.lastPlay.athletesInvolved?.map((a: any) => ({
                    id: a.id,
                    name: a.displayName,
                    headshot: a.headshot,
                    teamId: a.team?.id,
                    position: a.position,
                    jersey: a.jersey,
                  })) ?? [],
              }
            : undefined;

          setScore({
            home: { total: Number(homeComp.score) },
            away: { total: Number(awayComp.score) },
            periodScores,
            homeTeam: homeComp.team.displayName,
            awayTeam: awayComp.team.displayName,
            status: mappedStatus,
            statusText,
            displayClock,
            period,
            lastUpdated: Date.now(),
            lastPlay,
          });
        }
      } catch (err: any) {
        console.error(`[${league.toUpperCase()} Score] Error:`, err);
        setError(err.message || `Failed to fetch ${league.toUpperCase()} score`);
        setScore(undefined);
      } finally {
        setLoading(false);
      }
    },
    [homeIdOrName, awayIdOrName, date, skipFetch, league]
  );

  // --- initial + polling ---
  useEffect(() => {
    if (skipFetch) return;
    fetchScore(false);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => fetchScore(true), 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchScore, skipFetch]);

  // --- stop polling when final ---
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
